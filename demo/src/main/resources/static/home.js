// Profile Photo Upload Functionality
document.getElementById("uploadIcon").addEventListener("click", function () {
    document.getElementById("uploadPhoto").click();
});

document.getElementById("uploadPhoto").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const profileImage = document.getElementById("profileImage");
            profileImage.src = e.target.result;

            // Store the uploaded profile image in localStorage
            localStorage.setItem("profileImage", e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const savedProfileImage = localStorage.getItem("profileImage");
    if (savedProfileImage) {
        document.getElementById("profileImage").src = savedProfileImage;
    }
});

// Reset to Default Profile Image After Refresh
window.addEventListener("beforeunload", function () {
    // Clear the uploaded profile image from localStorage when refreshing
    localStorage.removeItem("profileImage");
});

// Add Post Functionality
document.getElementById("addPostButton").addEventListener("click", function () {
    const postInput = document.getElementById("postInput").value.trim();
    const mediaInput = document.getElementById("mediaInput").files;

    if (postInput === "" && mediaInput.length === 0) {
        alert("Cannot add an empty post!");
        return;
    }

    const mediaFiles = [];
    if (mediaInput.length > 0) {
        for (let i = 0; i < mediaInput.length; i++) {
            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                mediaFiles.push(e.target.result);
            };
            fileReader.readAsDataURL(mediaInput[i]);
        }
    }

    // Small delay to allow media files to load
    setTimeout(() => {
        createPost(postInput, mediaFiles);

        // Clear input fields after adding the post
        document.getElementById("postInput").value = ""; // Clear the post text
        document.getElementById("mediaInput").value = ""; // Clear the file input
    }, 500);
});

// Function to create a new post
function createPost(postText, mediaFiles, originalUserName = null) {
    const postContainer = document.getElementById("postContainer");
    const postDiv = document.createElement("div");
    postDiv.classList.add("user-post");

    const profileImage = localStorage.getItem("profileImage") || "assets/profile.jpg";

    // Add "Reposted from" if it's a repost
    const userNameText = originalUserName
        ? `Riya reposted this`
        : "Riya";

    const userInfo = `
        <div class="user-info" style="display: flex; align-items: center;">
            <img src="${profileImage}" alt="User Photo" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 15px;">
            <div class="user-details">
                <h3 style="margin-bottom: 5px;">${userNameText}</h3>
                <p style="color: #777;">Comedy content creator</p>
            </div>
        </div>
    `;

    const postContent = `
        <div class="post-content">
            <p class="post-text">${postText}</p>
        </div>
        <div class="comment-list"></div> <!-- Comment list section -->
    `;

    postDiv.innerHTML = userInfo + postContent;

    if (mediaFiles.length > 0) {
        mediaFiles.forEach(src => {
            const mediaElement = document.createElement("img");
            mediaElement.src = src;
            mediaElement.classList.add("post-image");
            postDiv.querySelector(".post-content").appendChild(mediaElement);
        });
    }

    const interactionIcons = `
        <div class="interaction-icons">
            <button class="like-button" data-liked="false" data-likes="0">❤ 0</button>
            <button class="share-button">🔗 Share</button>
            <button class="comment-button">💬 Comment</button>
            <button class="repost-button">🔄 Repost</button>
            <button class="delete-button">🗑️ Delete</button>
        </div>
        <div class="comment-box" style="display: none;">
            <textarea placeholder="Write a comment..."></textarea>
            <button class="submit-comment">Submit</button>
        </div>
    `;

    postDiv.innerHTML += interactionIcons;
    postContainer.prepend(postDiv);

    // Attach event listeners to the new post
    addPostInteractionListeners(postDiv);
}

// Function to add interaction listeners
function addPostInteractionListeners(postDiv) {
    // Like Button
    postDiv.querySelector(".like-button").addEventListener("click", function () {
        let likeCount = parseInt(this.getAttribute("data-likes"));
        const liked = this.getAttribute("data-liked") === "true";

        if (liked) {
            likeCount--;
            this.innerHTML = `❤ ${likeCount}`;
            this.setAttribute("data-liked", "false");
        } else {
            likeCount++;
            this.innerHTML = `❤ ${likeCount}`;
            this.setAttribute("data-liked", "true");
        }

        this.setAttribute("data-likes", likeCount);
    });

    // Comment Button
    postDiv.querySelector(".comment-button").addEventListener("click", function () {
        const commentBox = postDiv.querySelector(".comment-box");
        commentBox.style.display = commentBox.style.display === "none" ? "block" : "none";
    });

    // Submit Comment
    postDiv.querySelector(".submit-comment").addEventListener("click", function () {
        const commentInput = postDiv.querySelector(".comment-box textarea");
        const commentText = commentInput.value.trim();

        if (commentText) {
            const commentList = postDiv.querySelector(".comment-list");

            const commentItem = document.createElement("div");
            commentItem.innerHTML = `
                <div style="display: flex; align-items: center; margin-top: 10px;">
                    <img src="${localStorage.getItem("profileImage") || "assets/profile.jpg"}" alt="User Photo" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;">
                    <p style="margin: 0; font-size: 14px;"><strong>Riya:</strong> ${commentText}</p>
                </div>
            `;
            commentList.appendChild(commentItem);

            commentInput.value = "";
        } else {
            alert("Comment cannot be empty!");
        }
    });

    // Repost Button
    postDiv.querySelector(".repost-button").addEventListener("click", function () {
        const originalUserName = postDiv.querySelector(".user-details h3").innerText.split("Reposted from ")[1] || postDiv.querySelector(".user-details h3").innerText;
        const postText = postDiv.querySelector(".post-text").innerText;
        const mediaElements = postDiv.querySelectorAll(".post-image");
        const mediaSources = Array.from(mediaElements).map(img => img.src);
        createPost(postText, mediaSources, originalUserName);
    });

    // Share Button Functionality
    const shareButton = postDiv.querySelector(".share-button");
    if (shareButton) {
        shareButton.addEventListener("click", function () {
            const postText = postDiv.querySelector(".post-text").innerText;
            const shareData = {
                title: "Shared Post",
                text: postText,
                url: window.location.href
            };

            // Use Web Share API if available
            if (navigator.share) {
                navigator.share(shareData).catch(err => console.error("Share failed:", err));
            } else {
                alert("Sharing is not supported on this browser. Try copying the URL!");
            }
        });
    }

    // Delete Button
    postDiv.querySelector(".delete-button").addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this post?")) {
            postDiv.remove();
        }
    });
}

// Attach listeners to all posts on page load
document.addEventListener("DOMContentLoaded", function () {
    const allPosts = document.querySelectorAll(".user-post");
    allPosts.forEach(postDiv => addPostInteractionListeners(postDiv));
});

// Redirect to profile.html when profile image is clicked
document.getElementById("profileImage").addEventListener("click", function () {
    window.location.href = "profile.html";
});
// Redirect to mentorship.html when mentorship button is clicked
document.getElementById("mentorshipButton").addEventListener("click", function () {
    window.location.href = "mentoring.html"; // Replace with the correct path to your mentorship page
});
// Ensure the button redirects to the "network.html" page
document.getElementById("networkButton").addEventListener("click", function () {
    console.log("Connect & Grow button clicked!"); // Debug log
    window.location.href = "network.html"; // Ensure the file path is correct
});

// Chat Section
// Default list of friends
const defaultConnections = [
    { name: "Shruti Sharma", field: "Photographer" },
    { name: "John Art", field: "Graphic Designer" },
    { name: "Emily Capture", field: "Photographer" },
    { name: "Tom Voice", field: "Voice Artist" },
    { name: "Sara Writes", field: "Content Writer" },
    { name: "Chris Pixels", field: "Video Editor" },
    { name: "Leo Sketch", field: "Illustrator" },
    { name: "Emma Tune", field: "Music Producer" },
    { name: "Paul Streams", field: "Streamer" },
    { name: "Linda Creates", field: "DIY Creator" },
    { name: "Ryan Shoots", field: "Filmmaker" },
    { name: "Shruti Mengde", field: "Dancer" },
    { name: "Samiksha Nankar", field: "Memer" },
    { name: "Anjali Tiwary", field: "Musician" },
    { name: "Payal Nikam", field: "Playback Singer" },
];

// Chat responses
const chatResponses = {
    greeting: [
        "Hey there! How’s it going?",
        "Hi! Ready to brainstorm ideas?",
        "Hello! What's your next big idea?",
        "Hey! How can I assist you today?",
        "Hi there! What creative projects are you working on?",
    ],
    general: [
        "I'm doing great, thank you! How about you?",
        "I'm glad to hear that! What’s on your mind today?",
        "It’s always great working with you too!",
        "Thanks for saying that! Let’s keep creating amazing things together.",
        "I’m here to help. What can we discuss today?",
        "That’s a lovely thing to hear! Let’s make more progress together.",
        "I’m good, and I hope you are too!",
        "Let’s talk more about your goals and ideas!",
        "I’m thrilled to be working alongside such creative energy!",
        "Let’s focus on making something incredible today!",
    ],
    collaborations: [
        "Collaborations are a great way to grow! Have you connected with someone in your niche?",
        "Cross-promoting each other’s work can be really effective. Do you have someone in mind?",
        "Teamwork makes the dream work! What kind of collaboration are you looking for?",
        "Joint live streams or co-created videos are always engaging. Would you try that?",
        "Have you thought of collaborating with brands or other creators?",
    ],
    growth: [
        "Consistency is key. Are you posting regularly?",
        "Engage with your audience – replies and polls work wonders!",
        "Experiment with short-form content for better reach. Have you tried it?",
        "Leverage trending hashtags but make them relevant to your niche.",
        "Make sure your bio and profile clearly explain what you do.",
    ],
    equipment: [
        "A good ring light and decent microphone can make a big difference.",
        "What camera are you using? Upgrading lenses often gives better results.",
        "Have you tried external mics for cleaner audio quality?",
        "If you're filming on your phone, a gimbal can stabilize your videos beautifully.",
        "Editing software like Premiere Pro or Final Cut Pro is worth the investment.",
    ],
    monetization: [
        "Have you explored YouTube monetization options yet?",
        "Selling online courses or eBooks can be a good side hustle. Interested?",
        "Patreon is great for creating exclusive content for supporters.",
        "Do you use affiliate marketing for passive income?",
        "Collaborating with brands can help you monetize. Have you worked with any?",
    ],
    audienceEngagement: [
        "Ask questions in your captions to encourage comments.",
        "Interactive stories like polls and quizzes help a lot on Instagram.",
        "Go live! It’s a great way to connect directly with your audience.",
        "Have you tried creating challenges or asking for user-generated content?",
        "Regularly reply to comments and DMs. It builds trust with your audience.",
    ],
    struggles: [
        "Feeling stuck creatively? Sometimes taking a break helps.",
        "Burnout is real. Are you scheduling time to rest?",
        "If engagement is dropping, it might help to analyze your content strategy.",
        "Struggling with equipment? Start small and upgrade gradually.",
        "It’s okay to have off days. Remember why you started creating.",
    ],
    platformSpecific: [
        "TikTok thrives on trends. Have you tried hopping on one recently?",
        "Instagram reels are performing better than posts. Are you making reels?",
        "YouTube shorts are great for discovery. Have you tried them?",
        "LinkedIn works well for professionals. Have you shared your achievements there?",
        "Facebook groups can help you connect with niche communities. Have you joined any?",
    ],
    contentIdeas: [
        "Ever considered creating 'day-in-the-life' content?",
        "Tutorials and how-to videos always do well. What can you teach?",
        "Behind-the-scenes content feels personal and connects with audiences.",
        "Storytelling posts about your journey inspire people. Have you tried that?",
        "Answer FAQs from your audience. It makes for engaging content!",
    ],
    goodbye: [
        "Alright, take care! Keep creating amazing content!",
        "Goodbye! Let’s brainstorm more ideas soon.",
        "Bye for now! Hope your next post goes viral!",
        "Take care and stay inspired!",
        "Catch you later! Keep up the great work!",
    ],
};

// Get a random response
function getRandomResponse(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Determine the response for a message
function getChatResponse(message) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
        return getRandomResponse(chatResponses.greeting);
    } else if (
        lowerCaseMessage.includes("how are you") ||
        lowerCaseMessage.includes("working with you") ||
        lowerCaseMessage.includes("great")
    ) {
        return getRandomResponse(chatResponses.general);
    } else if (lowerCaseMessage.includes("collaborate") || lowerCaseMessage.includes("partner")) {
        return getRandomResponse(chatResponses.collaborations);
    } else if (lowerCaseMessage.includes("grow") || lowerCaseMessage.includes("growth")) {
        return getRandomResponse(chatResponses.growth);
    } else if (lowerCaseMessage.includes("equipment") || lowerCaseMessage.includes("tools")) {
        return getRandomResponse(chatResponses.equipment);
    } else if (lowerCaseMessage.includes("money") || lowerCaseMessage.includes("monetize")) {
        return getRandomResponse(chatResponses.monetization);
    } else if (lowerCaseMessage.includes("engage") || lowerCaseMessage.includes("audience")) {
        return getRandomResponse(chatResponses.audienceEngagement);
    } else if (lowerCaseMessage.includes("struggle") || lowerCaseMessage.includes("stuck")) {
        return getRandomResponse(chatResponses.struggles);
    } else if (lowerCaseMessage.includes("platform") || lowerCaseMessage.includes("specific")) {
        return getRandomResponse(chatResponses.platformSpecific);
    } else if (lowerCaseMessage.includes("content") || lowerCaseMessage.includes("ideas")) {
        return getRandomResponse(chatResponses.contentIdeas);
    } else if (lowerCaseMessage.includes("bye") || lowerCaseMessage.includes("goodbye")) {
        return getRandomResponse(chatResponses.goodbye);
    } else {
        return getRandomResponse(chatResponses.general); // General fallback
    }
}

// Initialize chat functionality
function initializeChat() {
    const chatList = document.getElementById("chatList");
    const chatWindow = document.getElementById("chatWindow");
    const chatBody = document.getElementById("chatBody");
    const chatInput = document.getElementById("chatInput");
    const sendMessageButton = document.getElementById("sendMessage");
    const backToChatListButton = document.getElementById("backToChatList");

    // Render the default connections in the chat list
    function renderConnections(connections) {
        chatList.innerHTML = ""; // Clear the previous list
        connections.forEach((connection) => {
            const connectionDiv = document.createElement("div");
            connectionDiv.classList.add("connection");
            connectionDiv.innerHTML = `
                <h3>${connection.name}</h3>
                <p>${connection.field}</p>
            `;
            connectionDiv.addEventListener("click", () => openChat(connection));
            chatList.appendChild(connectionDiv);
        });
    }

    // Open a chat window for a specific connection
    function openChat(connection) {
        chatList.style.display = "none";
        chatWindow.style.display = "flex";
        document.getElementById("chatUserName").textContent = connection.name;
        document.getElementById("chatUserField").textContent = connection.field;
        chatBody.innerHTML = `<p class="placeholder-text">Start a conversation with ${connection.name}</p>`;
    }

    // Add a message to the chat body
    function addMessage(message, sender) {
        const messageBubble = document.createElement("div");
        messageBubble.classList.add("chat-message", sender);
        messageBubble.textContent = message;
        chatBody.appendChild(messageBubble);
        chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the bottom
    }

    // Handle sending a message
    sendMessageButton.addEventListener("click", () => {
        const message = chatInput.value.trim();
        if (message) {
            // Add the user's message
            addMessage(message, "user");

            // Remove placeholder
            const placeholder = chatBody.querySelector(".placeholder-text");
            if (placeholder) placeholder.remove();

            // Clear the input field
            chatInput.value = "";

            // Simulate a response with a delay
            setTimeout(() => {
                const response = getChatResponse(message);
                addMessage(response, "system");
            }, 1000);
        }
    });

    // Go back to the chat list
    backToChatListButton.addEventListener("click", () => {
        chatWindow.style.display = "none";
        chatList.style.display = "flex";
    });

    // Search chat connections dynamically
    const searchChat = document.getElementById("searchChat");
    searchChat.addEventListener("input", () => {
        const searchTerm = searchChat.value.toLowerCase();
        const filteredConnections = defaultConnections.filter((connection) =>
            connection.name.toLowerCase().includes(searchTerm)
        );
        renderConnections(filteredConnections);
    });

    // Initial render of connections
    renderConnections(defaultConnections);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeChat);

