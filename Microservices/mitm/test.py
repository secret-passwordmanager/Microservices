import socketio

sio = socketio.Client()

sio.connect('http://73.66.169.37:8080', namespaces=['/Mitm'])


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
    print(swap)