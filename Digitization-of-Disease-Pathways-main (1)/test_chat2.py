import urllib.request, json
req = urllib.request.Request(
    'http://127.0.0.1:8000/chat',
    data=json.dumps({'message':'Hello', 'model':'llama', 'disease_name':"alzheimer's"}).encode('utf-8'),
    headers={'Content-Type':'application/json'}
)
try:
    print(urllib.request.urlopen(req).read())
except Exception as e:
    print(e)
