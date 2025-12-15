import sys
import json
import nmap
import socket

def scan_target(target_ip, scan_type):
    """
    Scans the target IP using Nmap and returns a JSON object.
    """
    nm = nmap.PortScanner()
    
    # 1. Define Arguments based on Scan Type
    if scan_type == 'quick':
        # -F: Fast mode (scans fewer ports)
        args = '-F -T4' 
    elif scan_type == 'full':
        # -p 1-1000: Scan top 1000 ports
        args = '-p 1-1000 -T4'
    else:
        return {"error": "Invalid scan type provided"}

    try:
        # 2. Run the Scan
        # We add 'sudo' if running as root, but for now we run as user (non-privileged scan)
        scan_result = nm.scan(hosts=target_ip, arguments=args)
        
        # 3. Check if host is up
        if target_ip not in scan_result['scan']:
            return {"status": "down", "message": f"Host {target_ip} appears to be down."}
            
        host_data = scan_result['scan'][target_ip]
        
        # 4. Extract relevant data (Clean up the output)
        parsed_result = {
            "status": "up",
            "ip": target_ip,
            "hostnames": host_data.get('hostnames', []),
            "open_ports": []
        }
        
        # specific logic to find open ports in TCP protocol
        if 'tcp' in host_data:
            for port, info in host_data['tcp'].items():
                if info['state'] == 'open':
                    parsed_result['open_ports'].append({
                        "port": port,
                        "service": info.get('name', 'unknown'),
                        "product": info.get('product', '')
                    })
                    
        return parsed_result

    except nmap.PortScannerError as e:
        return {"error": f"Nmap Error: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected Error: {str(e)}"}

if __name__ == "__main__":
    # Input from Command Line Arguments
    # Usage: python scanner.py <IP> <TYPE>
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments. Usage: scanner.py <IP> <TYPE>"}))
        sys.exit(1)

    target = sys.argv[1]
    type_of_scan = sys.argv[2]
    
    # Validate IP simply (to prevent passing command flags like -j)
    try:
        socket.inet_aton(target)
        # Output the result as JSON string (Standard Output)
        print(json.dumps(scan_target(target, type_of_scan), indent=2))
    except socket.error:
        print(json.dumps({"error": "Invalid IP address format"}))
