import urllib.request
import json
import sys

req = urllib.request.Request(
    'http://127.0.0.1:8000/chat',
    data=json.dumps({"message": "Hello", "model": "tinyllama", "disease_name": "alzheimer"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    with urllib.request.urlopen(req) as response:
        print("Success! Response:")
        for line in response:
            sys.stdout.buffer.write(line)
            sys.stdout.flush()
        print()
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
