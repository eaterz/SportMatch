// resources/js/services/echo.js

class EchoService {
    constructor() {
        this.echo = null;
        this.channels = new Map();
    }

    async initialize(pusherKey, pusherCluster = 'mt1') {
        if (this.echo) {
            return this.echo;
        }

        try {
            const Pusher = (await import('pusher-js')).default;
            const Echo = (await import('laravel-echo')).default;

            window.Pusher = Pusher;

            this.echo = new Echo({
                broadcaster: 'pusher',
                key: pusherKey,
                cluster: pusherCluster,
                forceTLS: true,
                authEndpoint: '/broadcasting/auth',
                auth: {
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            });

            console.log('Echo initialized successfully');
            return this.echo;
        } catch (error) {
            console.error('Failed to initialize Echo:', error);
            throw error;
        }
    }

    // Chat methods
    listenToChat(userId, onMessage) {
        if (!this.echo) {
            console.error('Echo not initialized');
            return null;
        }

        const channelName = `chat.${userId}`;

        if (this.channels.has(channelName)) {
            return this.channels.get(channelName);
        }

        const channel = this.echo.private(channelName)
            .listen('.message.sent', (e) => {
                console.log('Received chat message:', e);
                onMessage(e);
            })
            .error((error) => {
                console.error('Chat channel error:', error);
            });

        this.channels.set(channelName, channel);
        return channel;
    }

    // Group methods
    listenToGroup(groupId, callbacks) {
        if (!this.echo) {
            console.error('Echo not initialized');
            return null;
        }

        const channelName = `group.${groupId}`;

        if (this.channels.has(channelName)) {
            return this.channels.get(channelName);
        }

        const channel = this.echo.channel(channelName);

        // Listen for new posts
        if (callbacks.onPostCreated) {
            channel.listen('.post.created', (e) => {
                console.log('Received new post:', e);
                callbacks.onPostCreated(e);
            });
        }

        // Listen for new comments
        if (callbacks.onCommentAdded) {
            channel.listen('.comment.added', (e) => {
                console.log('Received new comment:', e);
                callbacks.onCommentAdded(e);
            });
        }

        // Listen for likes
        if (callbacks.onPostLiked) {
            channel.listen('.post.liked', (e) => {
                console.log('Received post like:', e);
                callbacks.onPostLiked(e);
            });
        }

        // Listen for post deletion
        if (callbacks.onPostDeleted) {
            channel.listen('.post.deleted', (e) => {
                console.log('Received post deletion:', e);
                callbacks.onPostDeleted(e);
            });
        }

        channel.error((error) => {
            console.error('Group channel error:', error);
        });

        this.channels.set(channelName, channel);
        return channel;
    }

    // Leave specific channel
    leaveChannel(channelName) {
        if (this.channels.has(channelName)) {
            try {
                this.echo.leaveChannel(channelName);
                this.channels.delete(channelName);
                console.log(`Left channel: ${channelName}`);
            } catch (error) {
                console.error(`Error leaving channel ${channelName}:`, error);
            }
        }
    }

    // Leave all channels and disconnect
    disconnect() {
        if (this.echo) {
            try {
                // Leave all channels
                this.channels.forEach((channel, channelName) => {
                    this.echo.leaveChannel(channelName);
                });
                this.channels.clear();

                // Disconnect Echo
                this.echo.disconnect();
                this.echo = null;
                console.log('Echo disconnected');
            } catch (error) {
                console.error('Error disconnecting Echo:', error);
            }
        }
    }

    // Get current echo instance
    getEcho() {
        return this.echo;
    }

    // Check if echo is initialized
    isInitialized() {
        return this.echo !== null;
    }
}

// Create singleton instance
const echoService = new EchoService();
export default echoService;
