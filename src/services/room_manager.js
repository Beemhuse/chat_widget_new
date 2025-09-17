import {EVENTS}  from "../lib/event.js";
import useStore from "../store/index.js"
class RoomManager {
  constructor() {
    this.webSocket = null;
    this.pendingMessages = new Map(); // Track pending messages by temp ID

    // Keepalive functionality
    this.pingInterval = null;
    this.pongTimeout = null;
    this.keepaliveInterval = 30000; // 30 seconds
    this.pongTimeoutDuration = 5000; // 5 seconds to wait for pong
    this.isWaitingForPong = false;
  }

  async connectToWebSocket(userToken, apiKey) {
    return new Promise((resolve, reject) => {
      try {
        // Construct WebSocket URL with query parameters for authentication
        // const baseUrl = process.env.NEXT_PUBLIC_COMMS_WS_URL.replace(
            //   /^http/,
            //   "ws"
            // );
            const baseUrl = "wss://api.clearcomms.space"
        const wsUrl = `${baseUrl}/api/socket/?api_key=${encodeURIComponent(apiKey)}&access_token=${encodeURIComponent(userToken)}`;

        console.log(
          "🔌 Connecting to WebSocket:",
          wsUrl
            .replace(/api_key=[^&]+/, "api_key=***")
            .replace(/access_token=[^&]+/, "access_token=***")
        );

        const ws = new WebSocket(wsUrl);

        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error("WebSocket connection timed out after 10 seconds"));
        }, 10000);

        ws.onopen = () => {
          clearTimeout(timeout);
          console.log("✅ WebSocket connected successfully");
          this.webSocket = ws;
          this.startKeepalive();
          resolve(ws);
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error("❌ WebSocket error:", error);
          this.stopKeepalive(); // Stop keepalive on error
          reject(new Error("Failed to connect to WebSocket"));
        };

        ws.onclose = (event) => {
          clearTimeout(timeout);
          console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
          this.webSocket = null;
          this.stopKeepalive();

          // Handle abnormal closures (like 1006) with potential reconnection
          if (event.code === 1006 || event.code === 1001) {
            console.warn(
              "Abnormal WebSocket closure detected. Connection lost unexpectedly."
            );
            // You could implement reconnection logic here if needed
          }
        };

        ws.onmessage = (event) => {
          this.handleWebSocketMessage(event);
        };
      } catch (error) {
        console.error("❌ Error creating WebSocket connection:", error);
        reject(error);
      }
    });
  }

  // Keepalive functionality
  startKeepalive() {
    console.log("Starting WebSocket keepalive");

    // Clear any existing intervals
    this.stopKeepalive();

    // Send ping every 30 seconds
    this.pingInterval = setInterval(() => {
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        if (this.isWaitingForPong) {
          console.warn(
            "Previous ping not acknowledged, WebSocket may be stale"
          );
          // Could implement reconnection logic here
          return;
        }

        console.log("Sending keepalive ping");
        this.isWaitingForPong = true;
        this.ping();

        // Set timeout for pong response
        this.pongTimeout = setTimeout(() => {
          console.error("Pong timeout - WebSocket connection may be dead");
          this.isWaitingForPong = false;
          // Could force reconnection here
        }, this.pongTimeoutDuration);
      } else {
        console.warn("WebSocket not ready for keepalive ping");
        this.stopKeepalive();
      }
    }, this.keepaliveInterval);
  }

  stopKeepalive() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }

    this.isWaitingForPong = false;
    console.log("Stopped WebSocket keepalive");
  }

  handleWebSocketMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log("📨 WebSocket message received:", message);

      // Handle different message types
      this.routeMessage(message);
    } catch (error) {
      console.error("❌ Failed to parse WebSocket message:", error);
    }
  }

  routeMessage(message) {
    console.log(`🔄 Routing message:`, { type: message.type });

    switch (message.type) {
      // Connection events
      case EVENTS.CONNECTED:
        this.handleConnected(message.data);
        break;
      case EVENTS.ERROR:
        this.handleError(message.data);
        break;
      case EVENTS.PONG:
        this.handlePong(message.data);
        break;

      // Room events
      case EVENTS.USER_CONNECTED:
        this.handleUserConnected(message.data);
        break;
      case EVENTS.USER_DISCONNECTED:
        this.handleUserDisconnected(message.data);
        break;
      case EVENTS.USER_JOINED_ROOM:
        this.handleUserJoinedRoom(message.data);
        break;
      case EVENTS.USER_LEFT_ROOM:
        this.handleUserLeftRoom(message.data);
        break;

      // Chat events
      case EVENTS.MESSAGE_SENT:
        this.handleMessageSent(message.data);
        break;
      case EVENTS.MESSAGE_RECEIVED:
        this.handleMessageReceived(message.data);
        break;

      // Media/Conference events
      case EVENTS.JOINED_CONFERENCE_AS_PUBLISHER:
        this.handleJoinedConferenceAsPublisher(message.data);
        break;
      case EVENTS.PUBLISHER_WEBRTC_CONNECTION_ESTABLISHED:
        this.handlePublisherWebRTCConnectionEstablished(message.data);
        break;
      case EVENTS.SUBSCRIBER_WEBRTC_CONNECTION_ESTABLISHED:
        this.handleSubscriberWebRTCConnectionEstablished(message.data);
        break;
      case EVENTS.RECEIVE_ANSWER_FOR_PUBLISHING:
        this.handleReceiveAnswerForPublishing(message.data);
        break;
      case EVENTS.SUBSCRIBED_TO_USER_FEED:
        this.handleSubscribedToUserFeed(message.data);
        break;
      case EVENTS.RECEIVE_ICE_CANDIDATES:
        this.handleReceiveIceCandidates(message.data);
        break;
      case EVENTS.PUBLISHER_LIST:
        this.handlePublisherList(message.data);
        break;
      case EVENTS.PUBLISHER_JOINED_CONFERENCE:
        this.handlePublisherJoinedConference(message.data);
        break;
      case EVENTS.USER_JOINED_CALL:
        this.handleUserJoinedCall(message.data);
        break;
      case EVENTS.USER_LEFT_CALL:
        this.handleUserLeftCall(message.data);
        break;
      case EVENTS.MEDIA_STREAM_TOGGLED:
        this.handleMediaStreamToggled(message.data);
        break;
      case EVENTS.PUBLISHER_TOGGLED_MEDIA_STREAM:
        this.handlePublisherToggledMediaStream(message.data);
        break;
      case EVENTS.FEED_UNPUBLISHED:
        this.handleFeedUnpublished(message.data);
        break;
      case EVENTS.PUBLISHER_UNPUBLISHED_FEED:
        this.handlePublisherUnpublishedFeed(message.data);
        break;
      case EVENTS.LEFT_CONFERENCE:
        this.handleLeftConference(message.data);
        break;
      case EVENTS.USER_LEFT_CONFERENCE:
        this.handleUserLeftConference(message.data);
        break;

      // Interaction events
      case EVENTS.SCREENSHOT_TAKEN:
        this.handleScreenshotTaken(message.data);
        break;
      case EVENTS.SCREENSHOT_TAKEN_BY_USER:
        this.handleScreenshotTakenByUser(message.data);
        break;
      case EVENTS.REACTION_SENT:
        this.handleReactionSent(message.data);
        break;
      case EVENTS.REACTION_RECEIVED:
        this.handleReactionReceived(message.data);
        break;
      case EVENTS.HAND_RAISED:
        this.handleHandRaised(message.data);
        break;
      case EVENTS.HAND_RAISED_BY_USER:
        this.handleHandRaisedByUser(message.data);
        break;
      case EVENTS.HAND_LOWERED:
        this.handleHandLowered(message.data);
        break;
      case EVENTS.HAND_LOWERED_BY_USER:
        this.handleHandLoweredByUser(message.data);
        break;

      // Moderation events
      case EVENTS.FEED_MODERATED:
        this.handleFeedModerated(message.data);
        break;
      case EVENTS.FEED_MODERATED_BY_HOST:
        this.handleFeedModeratedByHost(message.data);
        break;
      case EVENTS.MODERATION_SUCCESS:
        this.handleModerationSuccess(message.data);
        break;

      default:
        console.warn(`❓ Unknown message type: ${message.type}`);
    }
  }

  // Connection event handlers
  handleConnected(data) {
    console.log("✅ Connection confirmed by server:", data);
    // Update user connection status in store
    this.updateUserConnectionStatus(data);
  }

  handleError(data) {
    console.error("❌ Server error:", data);
    // Handle server errors
  }

  handlePong(data) {
    console.log("🏓 Pong received:", data);

    // Clear the pong timeout since we received a response
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }

    // Reset waiting state
    this.isWaitingForPong = false;

    console.log("✅ Keepalive pong acknowledged - connection is alive");
  }

  // Room event handlers
  handleUserConnected(data) {
    console.log("👤 User connected:", data);
    // data is UserSchema - update member connection status in store
    this.updateMemberConnectionStatus(data.id, true);
  }

  handleUserDisconnected(data) {
    console.log("👤 User disconnected:", data);
    // data is just the user ID (string)
    this.updateMemberConnectionStatus(data, false);
  }

  handleUserJoinedRoom(data) {
    console.log("🚪 User joined room:", data);
    // data is UserSchema - add new member to store
    this.addMemberToRoom(data);
  }

  handleUserLeftRoom(data) {
    console.log("🚪 User left room:", data);
    // data is just the user ID (string)
    this.removeMemberFromRoom(data);
  }

  // Chat event handlers
  handleMessageSent(data) {
    console.log("📨 Message sent confirmation:", data);
    // Handle message sent confirmation - remove pending status
    this.handleMessageSentConfirmation(data);
  }

  handleMessageReceived(data) {
    console.log("📨 New message received:", data);
    // Add message to store
    this.addMessageToStore(data);
  }

  // Media/Conference event handlers

  handlePublisherWebRTCConnectionEstablished(data) {
    console.log("🔗 Publisher WebRTC connection established:", data);
    // Publisher WebRTC connection is ready
    const store = useStore.getState();
    store.updateConferenceState({
      joinRequestState: { isLoading: false, error: null },
    });
  }

  handleSubscriberWebRTCConnectionEstablished(data) {
    console.log("🔗 Subscriber WebRTC connection established:", data);
    // Subscriber WebRTC connection is ready - stream should be flowing
  }

  handleReceiveAnswerForPublishing(data) {
    console.log("📞 Received answer for publishing:", data);

    // Find the most recent local feed that doesn't have a completed WebRTC connection
    const store = useStore.getState();

    // Look for a feed that has a peer connection but is in "have-local-offer" state
    let targetFeed = null;
    let targetPeerData = null;

    for (const feed of store.localFeeds) {
      if (feed.feedId) {
        const peerData = store.peers.get(feed.feedId);
        if (peerData && peerData.peerConnection && data.jsep) {
          const connectionState = peerData.peerConnection.signalingState;
          console.log(
            `🔍 Feed ${feed.feedId} (${feed.feedType}) connection state: ${connectionState}`
          );

          // Look for peer connection in "have-local-offer" state (waiting for answer)
          if (connectionState === "have-local-offer") {
            targetFeed = feed;
            targetPeerData = peerData;
            break;
          }
        }
      }
    }

    // Fallback: use the most recent feed with a feedId if no "have-local-offer" found
    if (!targetFeed) {
      // Get the most recently added feed (last in array)
      const feedsWithId = store.localFeeds.filter((f) => f.feedId);
      targetFeed = feedsWithId[feedsWithId.length - 1];
      if (targetFeed) {
        targetPeerData = store.peers.get(targetFeed.feedId);
      }
    }

    if (
      targetFeed &&
      targetPeerData &&
      targetPeerData.peerConnection &&
      data.jsep
    ) {
      console.log(
        `🎯 Applying answer to ${targetFeed.feedType} feed (feedId: ${targetFeed.feedId})`
      );
      targetPeerData.peerConnection
        .setRemoteDescription(data.jsep)
        .then(() => {
          console.log(
            `✅ Set remote description for ${targetFeed.feedType} publisher`
          );
          store.updateConferenceState({
            joinRequestState: { isLoading: false, error: null },
          });
        })
        .catch((error) => {
          console.error(
            `❌ Error setting remote description for ${targetFeed.feedType}:`,
            error
          );
          store.updateConferenceState({
            joinRequestState: { isLoading: false, error: error.message },
          });
        });
    } else {
      console.error(
        "No suitable local feed found for answer or missing peer connection data"
      );
    }
  }

  handleSubscribedToUserFeed(data) {
    console.log("📺 Subscribed to user feed:", data);

    const store = useStore.getState();
    const feedId = data.feedId;
    const peerData = store.peers.get(`sub-${feedId}`);

    if (peerData && peerData.peerConnection && data.jsep) {
      // Set remote description from server
      peerData.peerConnection
        .setRemoteDescription(data.jsep)
        .then(() => {
          // Create answer
          return peerData.peerConnection.createAnswer();
        })
        .then((answer) => {
          // Set local description
          return peerData.peerConnection.setLocalDescription(answer);
        })
        .then(() => {
          // Send answer to server
          this.sendMessage(EVENTS.SEND_ANSWER_FOR_SUBSCRIBING, {
            feedId,
            jsep: peerData.peerConnection.localDescription,
          });
        })
        .catch((error) => {
          console.error("❌ Error handling subscription:", error);
        });
    } else {
      console.error("Missing peer connection or jsep for feedId:", feedId);
    }
  }

  handleReceiveIceCandidates(data) {
    try {
      const { feedId, type, candidates } = data || {};
      const store = useStore.getState();
      const key = type === "subscriber" ? `sub-${feedId}` : feedId;
      const peerData = store.peers.get(key);
      if (!peerData || !peerData.peerConnection || !Array.isArray(candidates))
        return;

      candidates.forEach((cand) => {
        try {
          peerData.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.error("Error adding ICE candidate", e);
        }
      });
    } catch (e) {
      console.error("Failed handling RECEIVE_ICE_CANDIDATES", e);
    }
  }

  handlePublisherList(data) {
    console.log("📋 Publisher list received:", data);
    // Update publishers in store
    this.updatePublishersInStore(data);
  }

  handlePublisherJoinedConference(data) {
    console.log("🎥 Publisher joined conference:", data);

    // Add new publisher to remote feeds
    const publisher = data.publisher;
    if (publisher) {
      const store = useStore.getState();
      const publisherId = publisher.id;
      const publisherUserId = publisher.userId;

      console.log("🔍 Processing publisher:", {
        publisherId,
        publisherUserId,
        currentUserId: store.user?.id,
        publisher,
      });

      if (publisherId && publisherUserId) {
        // Check if this is the current user's publisher
        if (publisherUserId !== store.user?.id) {
          console.log("➕ Adding remote publisher:", publisherId);
          // Add userId to publisher object since server doesn't include it
          this.addPublisherToStore({ ...publisher, userId: publisherUserId });
          // Subscribe to the new publisher's feed
          this.subscribeToUserFeed(publisherId);
        } else {
          console.log(
            "⏭️ Skipping own publisher (already handled as local feed):",
            publisherId
          );
        }
      } else {
        console.warn("❌ Invalid publisher data:", {
          publisherId,
          publisherUserId,
          publisher,
        });
      }
    } else {
      console.warn(
        "❌ No publishers in PUBLISHER_JOINED_CONFERENCE event:",
        data
      );
    }
  }

  handleUserJoinedCall(data) {
    console.log("📞 User joined call:", data);
    // data is { userId: string }
    this.updateMemberCallStatus(data.userId, true);
  }

  handleUserLeftCall(data) {
    console.log("📞 User left call:", data);
    // data is { userId: string }
    this.updateMemberCallStatus(data.userId, false);
  }

  handleMediaStreamToggled(data) {
    console.log("🎵 Media stream toggled:", data);
    // Handle media stream toggle response
  }

  handlePublisherToggledMediaStream(data) {
    console.log("🎵 Publisher toggled media stream:", data);
    // Update publisher media status in store
    this.updatePublisherMediaStatus(data);
  }

  handleFeedUnpublished(data) {
    console.log("📺 Feed unpublished:", data);
    const feedId = data.feedId;
    const store = useStore.getState();

    // Find and remove the local feed
    const localFeed = store.localFeeds.find((f) => f.feedId === feedId);
    if (localFeed) {
      // Close the peer connection
      const peerData = store.peers.get(feedId);
      if (peerData && peerData.peerConnection) {
        peerData.peerConnection.close();
        store.removePeer(feedId);
      }

      // Remove the local feed from store
      store.removeLocalFeed(feedId);
      console.log(`🗑️ Removed local ${localFeed.feedType} feed:`, feedId);
    }
  }

  handlePublisherUnpublishedFeed(data) {
    console.log("📺 Publisher unpublished feed:", data);
    // Remove publisher from store
    this.removePublisherFromStore(data.feedId);
  }

  handleLeftConference(data) {
    console.log("🚪 Left conference:", data);

    const store = useStore.getState();

    // Clean up all peer connections
    store.peers.forEach((peerData) => {
      if (peerData.peerConnection) {
        peerData.peerConnection.close();
      }
    });

    // Reset all conference-related state
    store.setPeers(new Map());
    store.setLocalFeeds([]);
    store.setRemoteFeeds([]);
    store.updateConferenceState({
      step: "pending",
      joinedConference: false,
      joinRequestState: { isLoading: false, error: null },
    });
  }

  handleUserLeftConference(data) {
    console.log("🚪 User left conference:", data);

    const store = useStore.getState();
    const userId = data.userId;

    // Update user conference status
    this.updateMemberCallStatus(userId, false);

    // Find and remove all feeds belonging to this user
    const userFeeds = store.remoteFeeds.filter(
      (feed) => feed.userId === userId
    );

    userFeeds.forEach((feed) => {
      if (feed.feedId) {
        // Close and remove subscriber peer connection
        const subscriberPeerData = store.peers.get(`sub-${feed.feedId}`);
        if (subscriberPeerData && subscriberPeerData.peerConnection) {
          console.log(
            `🔌 Closing subscriber peer connection for feedId: ${feed.feedId}`
          );
          subscriberPeerData.peerConnection.close();
          store.removePeer(`sub-${feed.feedId}`);
        }

        // Remove the remote feed
        console.log(
          `🗑️ Removing remote feed for user ${userId}, feedId: ${feed.feedId}`
        );
        store.removeRemoteFeed(feed.feedId);
      }
    });

    console.log(
      `✅ Cleaned up ${userFeeds.length} feeds for user ${userId} who left conference`
    );
  }

  // Interaction event handlers
  handleScreenshotTaken(data) {
    console.log("📸 Screenshot taken:", data);
    // Handle screenshot notification response
  }

  handleScreenshotTakenByUser(data) {
    console.log("📸 Screenshot taken by user:", data);
    const { addNotification, members } = useStore.getState();

    // Find user name
    const user = members.find((m) => m.id === data.userId);
    const userName = user ? user.name : `User ${data.userId}`;

    // Show screenshot notification to all users in the room
    addNotification({
      type: "screenshot",
      title: "Screenshot Taken",
      message: `${userName} took a screenshot`,
      timestamp: Date.now(),
    });
  }

  handleReactionSent(data) {
    console.log("😀 Reaction sent:", data);
    // Handle reaction sent response
  }

  handleReactionReceived(data) {
    console.log("😀 Reaction received:", data);
    const { addReaction, localFeeds, remoteFeeds } = useStore.getState();

    // Find the primary feed for this user (prefer camera feed over screenshare)
    const allFeeds = [...localFeeds, ...remoteFeeds];
    let userFeed = allFeeds.find(
      (f) => f.userId === data.userId && f.feedType === "camera"
    );

    // If no camera feed, use any feed from this user
    if (!userFeed) {
      userFeed = allFeeds.find((f) => f.userId === data.userId);
    }

    // Add reaction to store with the found feedId
    addReaction({
      emoji: data.reaction,
      userId: data.userId,
      feedId: userFeed?.feedId || null,
      timestamp: Date.now(),
    });
  }

  handleHandRaised(data) {
    console.log("✋ Hand raised:", data);
    // Handle hand raise response
  }

  handleHandRaisedByUser(data) {
    console.log("✋ Hand raised by user:", data);
    // Update member hand raised status
    this.updateMemberHandRaisedStatus(data.userId, true);
  }

  handleHandLowered(data) {
    console.log("👇 Hand lowered:", data);
    // Handle hand lower response
  }

  handleHandLoweredByUser(data) {
    console.log("👇 Hand lowered by user:", data);
    // Update member hand raised status
    this.updateMemberHandRaisedStatus(data.userId, false);
  }

  // Moderation event handlers
  handleFeedModerated(data) {
    console.log("🔧 Feed moderated:", data);
    const { addNotification, localFeeds, removeLocalFeed, removePeer, peers } =
      useStore.getState();

    // Find and remove the local feed that was moderated
    const moderatedFeed = localFeeds.find((f) => f.feedId === data.feedId);
    if (moderatedFeed) {
      // Close the peer connection
      const peerData = peers.get(data.feedId);
      if (peerData && peerData.peerConnection) {
        console.log(
          `🔌 Closing peer connection for moderated feed: ${data.feedId}`
        );
        peerData.peerConnection.close();
        removePeer(data.feedId);
      }

      // Remove the local feed from store
      removeLocalFeed(data.feedId);
      console.log(
        `🗑️ Removed moderated local feed: ${data.feedId} (${moderatedFeed.feedType})`
      );

      // Show notification that their feed was moderated
      addNotification({
        type: "moderation",
        title: "Your Feed Was Moderated",
        message: `Your ${moderatedFeed.feedType} feed has been removed by the host`,
        timestamp: Date.now(),
      });

      // Check if user has any remaining local feeds
      const remainingLocalFeeds = localFeeds.filter(
        (f) => f.feedId !== data.feedId
      );
      if (remainingLocalFeeds.length === 0) {
        console.log(
          "🚪 No local feeds remaining after moderation - leaving call"
        );
        // Automatically leave the call
        this.leaveConference();

        // Show notification about leaving call
        addNotification({
          type: "warning",
          title: "Removed from Call",
          message: "You have been removed from the call by the host",
          timestamp: Date.now(),
        });
      }
    } else {
      // Fallback notification if feed not found locally
      addNotification({
        type: "moderation",
        title: "Your Feed Was Moderated",
        message: "Your video feed has been moderated by the host",
        timestamp: Date.now(),
      });
    }
  }

  handleFeedModeratedByHost(data) {
    console.log("🔧 Feed moderated by host:", data);
    const { addNotification, members } = useStore.getState();

    // Find user name
    const moderatedUser = members.find((m) => m.id === data.userId);
    const userName = moderatedUser ? moderatedUser.name : `User ${data.userId}`;

    // Notify room that a feed was moderated (this is just for other users to see)
    addNotification({
      type: "moderation",
      title: "Feed Moderated",
      message: `${userName}'s feed was moderated by the host`,
      timestamp: Date.now(),
    });
  }

  handleModerationSuccess(data) {
    console.log("✅ Moderation success:", data);
    // Handle moderation success response - notification handled in UI
  }

  // Helper methods to interact with store (these will be implemented later)
  updateUserConnectionStatus(userData) {
    const store = useStore.getState();

    // Update the current user's connected status
    store.setUser({ ...store.user, connected: true });

    // Also update the user in members array
    store.updateMember(userData.id, { connected: true });

    console.log("🔄 Updated user connection status:", userData);
  }

  updateMemberConnectionStatus(userId, connected) {
    const store = useStore.getState();
    store.updateMember(userId, { connected });
    console.log(`🔄 Updated member ${userId} connection status:`, connected);
  }

  addMemberToRoom(memberData) {
    const store = useStore.getState();
    // memberData is UserSchema - add isHost property based on room host
    const memberWithHostFlag = {
      ...memberData,
      isHost: memberData.id === store.room?.hostId,
    };
    store.addMember(memberWithHostFlag);
    console.log("🔄 Added member to room:", memberData);
  }

  removeMemberFromRoom(userId) {
    const store = useStore.getState();
    store.removeMember(userId);
    console.log("🔄 Removed member from room:", userId);
  }

  addMessageToStore(messageData) {
    // Ensure dates are ISO strings for consistency
    const normalizedMessage = {
      ...messageData,
      createdAt:
        messageData.createdAt instanceof Date
          ? messageData.createdAt.toISOString()
          : messageData.createdAt,
      updatedAt:
        messageData.updatedAt instanceof Date
          ? messageData.updatedAt.toISOString()
          : messageData.updatedAt,
    };
    useStore.getState().addMessage(normalizedMessage);
    console.log("🔄 Adding message to store:", normalizedMessage);
  }

  updatePublishersInStore(publishersData) {
    // Convert StandardizedPublisher schema to feed format for remote feeds only
    const store = useStore.getState();
    const currentUserId = store.user?.id;

    const feeds = publishersData
      .filter((publisher) => publisher.userId !== currentUserId) // Exclude self
      .map((publisher) => ({
        id: `handle-${publisher.id}`,
        feedId: publisher.id,
        userId: publisher.userId,
        feedType: publisher.feedType,
        audioEnabled: publisher.audio,
        videoEnabled: publisher.video,
        handRaised: publisher.handRaised,
        stream: null, // Will be set when WebRTC connection is established
        isLocal: false, // These are remote publishers
        userName: this.getUserNameById(publisher.userId),
      }));

    store.setRemoteFeeds(feeds);
    console.log("🔄 Updated remote feeds in store:", feeds);
  }

  addPublisherToStore(publisherData) {
    if (!publisherData) {
      console.error("Cannot add publisher: publisherData is null");
      return;
    }

    const feedId =
      publisherData.feed || publisherData.feedId || publisherData.id;
    const USERID = publisherData.userId || publisherData.display;

    if (!feedId || !USERID) {
      console.error(
        "Cannot add publisher: missing feedId or userId",
        publisherData
      );
      return;
    }

    const feed = {
      id: publisherData.id || `handle-${feedId}`,
      feedId,
      userId: USERID,
      feedType: publisherData.feedType || "camera",
      audioEnabled: publisherData.audio !== false, // Use audio property, default to true
      videoEnabled: publisherData.video !== false, // Use video property, default to true
      handRaised: publisherData.handRaised || false,
      stream: null, // Will be set when WebRTC connection establishes
      isLocal: false,
      userName: this.getUserNameById(USERID),
    };

    useStore.getState().addRemoteFeed(feed);
    console.log("🔄 Added remote feed to store:", feed);
  }

  removePublisherFromStore(feedId) {
    useStore.getState().removeRemoteFeed(feedId);
    console.log("🔄 Removed remote feed from store:", feedId);
  }

  updateMemberCallStatus(userId, inCall) {
    const store = useStore.getState();
    store.updateMember(userId, { joinedCall: inCall });
    console.log(`🔄 Updated member ${userId} call status:`, inCall);
  }

  updatePublisherMediaStatus(data) {
    const { feedId, audio, video } = data;

    // Check if it's a local feed or remote feed
    const store = useStore.getState();
    const isLocalFeed = store.localFeeds.some((f) => f.feedId === feedId);

    const updates = {
      audioEnabled: audio,
      videoEnabled: video,
    };

    if (isLocalFeed) {
      store.updateLocalFeed(feedId, updates);
      console.log("🔄 Updated local feed media status:", {
        feedId,
        ...updates,
      });
    } else {
      store.updateRemoteFeed(feedId, updates);
      console.log("🔄 Updated remote feed media status:", {
        feedId,
        ...updates,
      });
    }
  }

  updateMemberHandRaisedStatus(userId, handRaised) {
    // Update member status
    useStore.getState().updateMember(userId, { handRaised });

    // Also update any feeds for this user
    const store = useStore.getState();

    // Update local feeds
    store.localFeeds.forEach((feed) => {
      if (feed.userId === userId) {
        store.updateLocalFeed(feed.feedId, { handRaised });
      }
    });

    // Update remote feeds
    store.remoteFeeds.forEach((feed) => {
      if (feed.userId === userId) {
        store.updateRemoteFeed(feed.feedId, { handRaised });
      }
    });

    console.log(`🔄 Updated user ${userId} hand raised status:`, handRaised);
  }

  handleMessageSentConfirmation(confirmedMessage) {
    // Find the pending message by content
    const tempMessageId = this.pendingMessages.get(
      confirmedMessage.content.trim()
    );
    if (tempMessageId) {
      // Normalize dates to ISO strings for consistency
      const normalizedMessage = {
        ...confirmedMessage,
        createdAt:
          confirmedMessage.createdAt instanceof Date
            ? confirmedMessage.createdAt.toISOString()
            : confirmedMessage.createdAt,
        updatedAt:
          confirmedMessage.updatedAt instanceof Date
            ? confirmedMessage.updatedAt.toISOString()
            : confirmedMessage.updatedAt,
        pending: false,
      };
      // Remove pending status and update with server data
      useStore
        .getState()
        .removeMessagePendingStatus(tempMessageId, normalizedMessage);
      // Clean up pending messages map
      this.pendingMessages.delete(confirmedMessage.content.trim());
      console.log("✅ Message confirmation processed:", {
        tempMessageId,
        normalizedMessage,
      });
    }
  }

  // Helper method to get user name by ID from store
  getUserNameById(userId) {
    const store = useStore.getState();
    const member = store.members.find((m) => m.id === userId);
    return member ? member.name : `User ${userId}`;
  }

  // Conference-specific handlers
  handleJoinedConferenceAsPublisher(data) {
    console.log("🎥 Joined conference as publisher:", data);

    const store = useStore.getState();

    // Set joinedConference to true
    store.updateConferenceState({ joinedConference: true });

    // Extract feed info from new schema format
    const { feed, publishers } = data;
    const feedId = feed.id;
    const feedType = feed.feedType;

    // Find the local feed that matches this response based on feedType from server
    let targetLocalFeed;
    if (feedType === "screenshare") {
      targetLocalFeed = store.localFeeds.find(
        (f) => f.feedType === "screenshare"
      );
    } else {
      targetLocalFeed = store.localFeeds.find((f) => f.feedType === "camera");
    }

    // Fallback to any feed without feedId
    if (!targetLocalFeed) {
      targetLocalFeed =
        store.localFeeds.find((f) => !f.feedId) ||
        store.localFeeds[store.localFeeds.length - 1];
    }

    if (targetLocalFeed) {
      // Create updated feed with actual feedId and server data
      const updatedFeed = {
        ...targetLocalFeed,
        feedId: feedId,
        id: `local-handle-${feedId}`,
        feedType: feedType,
        audioEnabled: feed.audio,
        videoEnabled: feed.video,
        handRaised: feed.handRaised,
      };

      // Update the specific feed in the array
      const updatedFeeds = store.localFeeds.map((feed) =>
        feed.id === targetLocalFeed.id ? updatedFeed : feed
      );
      store.setLocalFeeds(updatedFeeds);

      // Create publisher peer connection with the appropriate stream
      const localStream =
        feedType === "screenshare"
          ? this.tempScreenStream
          : this.tempLocalStream;

      if (localStream) {
        this.createPublisherPeerConnection(feedId, localStream);

        // Clean up the temporary stream reference
        if (feedType === "screenshare") {
          this.tempScreenStream = null;
        } else {
          this.tempLocalStream = null;
        }
      } else {
        console.error("No local stream available for publisher connection");
      }
    }

    // For screenshare feeds, do NOT subscribe to other publishers
    // Only negotiate the WebRTC connection for publishing
    const isScreenshare = feedType === "screenshare";

    if (!isScreenshare && publishers && publishers.length > 0) {
      // Only subscribe to other publishers for camera feeds
      this.updatePublishersInStore(publishers);

      // Create subscriber connections for each existing publisher
      publishers.forEach((publisher) => {
        const publisherId = publisher.id;
        if (publisherId && publisher.userId !== store.user?.id) {
          this.subscribeToUserFeed(publisherId);
        }
      });
    }

    console.log(
      `🔄 Set up WebRTC connections for ${isScreenshare ? "screenshare" : "camera"} conference`
    );
  }

  // WebSocket message sending methods
  sendMessage(type, data) {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      const message = { type };
      if (data !== undefined) {
        message.data = data;
      }
      console.log("📤 Sending WebSocket message:", message);
      this.webSocket.send(JSON.stringify(message));
      return true;
    } else {
      console.error("❌ WebSocket not connected, cannot send message:", {
        type,
        data,
      });
      return false;
    }
  }

  // Client-to-server message methods
  sendChatMessage(content, tempMessageId) {
    // Store the temp message ID for later confirmation
    if (tempMessageId) {
      this.pendingMessages.set(content.trim(), tempMessageId);
    }
    return this.sendMessage(EVENTS.SEND_MESSAGE, content);
  }

  joinConferenceAsPublisher(options = {}) {
    const { feedType = "camera", audio = true, video = true } = options;
    return this.sendMessage(EVENTS.JOIN_CONFERENCE_AS_PUBLISHER, {
      feedType,
      audio,
      video,
    });
  }

  sendOfferForPublishing(offer) {
    return this.sendMessage(EVENTS.SEND_OFFER_FOR_PUBLISHING, offer);
  }

  sendAnswerForSubscribing(answer) {
    return this.sendMessage(EVENTS.SEND_ANSWER_FOR_SUBSCRIBING, answer);
  }

  sendIceCandidates(candidates) {
    return this.sendMessage(EVENTS.SEND_ICE_CANDIDATES, candidates);
  }

  sendIceCandidateCompleted(feedId) {
    return this.sendMessage(EVENTS.SEND_ICE_CANDIDATE_COMPLETED, { feedId });
  }

  subscribeToUserFeed(feedId) {
    if (!feedId) {
      console.error("Cannot subscribe to feed: feedId is null or undefined");
      return;
    }

    console.log("📡 Subscribing to user feed:", feedId);

    // Create subscriber peer connection first
    this.createSubscriberPeerConnection(feedId);
    // Then send subscription request
    return this.sendMessage(EVENTS.SUBSCRIBE_TO_USER_FEED, feedId);
  }

  getPublisherList() {
    return this.sendMessage(EVENTS.GET_PUBLISHER_LIST, {});
  }

  toggleMediaStream(feedId, mediaTypeOrPayload, maybeEnabled) {
    // Support two signatures:
    // 1) (feedId, { audio: boolean, video: boolean })
    // 2) (feedId, mediaType: 'audio'|'video', enabled: boolean) -> derive the other flag from store
    let payload;
    if (typeof mediaTypeOrPayload === "object" && mediaTypeOrPayload !== null) {
      const { audio, video } = mediaTypeOrPayload;
      payload = { feedId, audio: !!audio, video: !!video };
    } else {
      const mediaType = mediaTypeOrPayload;
      const enabled = !!maybeEnabled;
      const store = useStore.getState();
      // Find feed in local or remote feeds
      const local = store.localFeeds.find((f) => f.feedId === feedId);
      const remote = local
        ? null
        : store.remoteFeeds.find((f) => f.feedId === feedId);
      const current = local || remote || {};
      const currentAudio =
        current.audioEnabled !== undefined ? !!current.audioEnabled : true;
      const currentVideo =
        current.videoEnabled !== undefined ? !!current.videoEnabled : true;
      payload = {
        feedId,
        audio: mediaType === "audio" ? enabled : currentAudio,
        video: mediaType === "video" ? enabled : currentVideo,
      };
    }
    return this.sendMessage(EVENTS.TOGGLE_MEDIA_STREAM, payload);
  }

  leaveConference() {
    return this.sendMessage(EVENTS.LEAVE_CONFERENCE);
  }

  sendScreenshotNotification() {
    return this.sendMessage(EVENTS.SEND_SCREENSHOT_NOTIFICATION, {});
  }

  sendReaction(reaction) {
    return this.sendMessage(EVENTS.SEND_REACTION, reaction);
  }

  raiseHand(feedId) {
    return this.sendMessage(EVENTS.RAISE_HAND, { feedId });
  }

  lowerHand(feedId) {
    return this.sendMessage(EVENTS.LOWER_HAND, { feedId });
  }

  moderateFeed(feedId, action) {
    return this.sendMessage(EVENTS.MODERATE_FEED, { feedId, action });
  }

  ping() {
    return this.sendMessage(EVENTS.PING, {});
  }

  disconnect() {
    this.stopKeepalive();
    return this.sendMessage(EVENTS.DISCONNECT, {});
  }

  // Add cleanup method to be called when RoomManager is destroyed
  cleanup() {
    this.stopKeepalive();
    if (this.webSocket) {
      this.webSocket.close(1000, "Client cleanup"); // Normal closure
      this.webSocket = null;
    }
  }

  unpublishFeed(feedId) {
    return this.sendMessage(EVENTS.UNPUBLISH_FEED, { feedId });
  }

  // WebRTC Helper Methods
  createPublisherPeerConnection(feedId, localStream) {
    if (!localStream) {
      console.error("No local stream available for publisher");
      return;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local stream tracks
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    const store = useStore.getState();

    // Store peer connection with ICE candidate collection
    store.addPeer(feedId, {
      peerConnection,
      candidates: [],
      iceCompleted: false,
      type: "publisher",
    });

    // Handle ICE candidates (collect in bulk)
    peerConnection.onicecandidate = (event) => {
      const currentStore = useStore.getState();
      const peerData = currentStore.peers.get(feedId);

      if (event.candidate) {
        // Collect candidates
        if (peerData) {
          peerData.candidates.push(event.candidate);
        }
      } else {
        // ICE gathering complete - send all candidates
        if (peerData && !peerData.iceCompleted) {
          peerData.iceCompleted = true;

          // Send candidates in bulk
          this.sendMessage(EVENTS.SEND_ICE_CANDIDATES, {
            feedId,
            type: "publisher",
            candidates: peerData.candidates,
          });

          // Send completion notification
          this.sendMessage(EVENTS.SEND_ICE_CANDIDATE_COMPLETED, {
            feedId,
            type: "publisher",
          });
        }
      }
    };

    // Create and send offer
    peerConnection
      .createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        this.sendMessage(EVENTS.SEND_OFFER_FOR_PUBLISHING, {
          feedId,
          jsep: peerConnection.localDescription,
        });
      })
      .catch((error) => {
        console.error("Error creating publisher offer:", error);
      });

    console.log("📡 Created publisher peer connection for feedId:", feedId);
  }

  createSubscriberPeerConnection(feedId) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const store = useStore.getState();

    // Store peer connection
    store.addPeer(`sub-${feedId}`, {
      peerConnection,
      candidates: [],
      iceCompleted: false,
      type: "subscriber",
      feedId,
    });

    // Handle incoming stream - THIS IS CRITICAL!
    peerConnection.ontrack = (event) => {
      console.log("📺 Received remote stream for feedId:", feedId);
      const [remoteStream] = event.streams;

      if (remoteStream) {
        // Update remote feed with the stream
        const currentStore = useStore.getState();
        currentStore.updateRemoteFeed(feedId, { stream: remoteStream });
        console.log("✅ Updated remote feed stream for feedId:", feedId);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      const currentStore = useStore.getState();
      const peerData = currentStore.peers.get(`sub-${feedId}`);

      if (event.candidate) {
        // Collect candidates
        if (peerData) {
          peerData.candidates.push(event.candidate);
        }
      } else {
        // ICE gathering complete - send all candidates
        if (peerData && !peerData.iceCompleted) {
          peerData.iceCompleted = true;

          // Send candidates in bulk
          this.sendMessage(EVENTS.SEND_ICE_CANDIDATES, {
            feedId,
            type: "subscriber",
            candidates: peerData.candidates,
          });

          // Send completion notification
          this.sendMessage(EVENTS.SEND_ICE_CANDIDATE_COMPLETED, {
            feedId,
            type: "subscriber",
          });
        }
      }
    };

    console.log("📡 Created subscriber peer connection for feedId:", feedId);
    return peerConnection;
  }

  // Helper method to get local stream
  getLocalStream() {
    return this.tempLocalStream || useStore.getState().localFeeds[0]?.stream;
  }
}

export default RoomManager;
