// Test Pusher connection independently
import Pusher from 'pusher-js';

// Enable Pusher logging
Pusher.logToConsole = true;

const pusher = new Pusher('2c84f30acccad293fc55', {
    cluster: 'eu',
    forceTLS: true
});

// Test connection
pusher.connection.bind('connected', () => {
    console.log('✅ Connected to Pusher!');
    console.log('Socket ID:', pusher.connection.socket_id);
});

pusher.connection.bind('error', (err) => {
    console.error('❌ Pusher Error:', err);
});

// Test subscribing to a channel
const channel = pusher.subscribe('test-channel');

channel.bind('pusher:subscription_succeeded', () => {
    console.log('✅ Subscribed to test channel');
});

channel.bind('test-event', (data) => {
    console.log('Received test event:', data);
});
