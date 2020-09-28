from mitmproxy import ctx
from mitmproxy import http
from datetime import datetime
from datetime import timedelta
import regex
import tldextract
import pyodbc
import socketio

userSwaps = dict()


sio = socketio.Client()

sio.connect('http://secret_swapman', namespaces=['/Mitm'])


@sio.event(namespace='/Mitm')
def connect():
    print('connection established')

@sio.event(namespace='/Mitm')
def connect_error():
    print("The connection failed!")

@sio.event(namespace='/Mitm')
def disconnect():
    print("I'm disconnected!")


@sio.event(namespace='/Mitm')
def swapApproved(swap):

    # If user (ip) doesn't yet exist, init empty array
    if swap['ip'] not in userSwaps:
        userSwaps[swap['ip']] = []
    # Push swap into userSwaps
    userSwaps[swap['ip']].append(swap)

    # Let swapman know you received the swap
    sio.emit('swapReceived', swap, namespace='/Mitm')
    
    print(userSwaps[swap['ip']])


def request(flow: http.HTTPFlow) -> None:
    if flow.request.method == "POST":
        address = flow.client_conn.address[0]
        ip = regex.sub(r'^.*:', '', address)
        host = flow.request.pretty_host
        ext = tldextract.extract(host)
        domain = ext.domain + "." + ext.suffix

        swaps = userSwaps[swap[ip]]

        form = flow.request.urlencoded_form
        
        # Check if token exists in form if it exists
        if (form is not None):
            keys = form.keys()
            for key in keys:
                values = form.get_all(key)

                for swap in swaps:
                    if swap['token'] in values:
                        form.set_all(key, [swap['credVal']])
                        swap.remove(swap)
                        print('In form swap')
        

        for swap in swaps:
            flow.request.content = flow.request.content.replace(bytes(swap['token'], encoding='utf-8'), bytes(swap['credVal'], encoding='utf-8'))
            print('in normal swap')