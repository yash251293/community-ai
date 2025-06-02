const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'src', 'services', 'users.json');

// Helper function to read users from the JSON file
const readUsers = () => {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE);
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading users file:", error);
    }
    return []; // Return empty array if file doesn't exist or error occurs
};

// Helper function to write users to the JSON file
const writeUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error)
        {
        console.error("Error writing users file:", error);
    }
};

// Initialize users from file or create an empty array
let users = readUsers();
// No need to create users.json here, startup logic handles it.


// --- Service Requests Data ---
const REQUESTS_FILE = path.join(__dirname, 'src', 'services', 'servicerequests.json');

const readServiceRequests = () => {
    try {
        if (fs.existsSync(REQUESTS_FILE)) {
            const data = fs.readFileSync(REQUESTS_FILE);
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading service requests file:", error);
    }
    return [];
};

const writeServiceRequests = (requests) => {
    try {
        fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));
    } catch (error) {
        console.error("Error writing service requests file:", error);
    }
};
let serviceRequests = readServiceRequests();

// --- Service Offers Data ---
const OFFERS_FILE = path.join(__dirname, 'src', 'services', 'serviceoffers.json');

const readServiceOffers = () => {
    try {
        if (fs.existsSync(OFFERS_FILE)) {
            const data = fs.readFileSync(OFFERS_FILE);
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading service offers file:", error);
    }
    return [];
};

const writeServiceOffers = (offers) => {
    try {
        fs.writeFileSync(OFFERS_FILE, JSON.stringify(offers, null, 2));
    } catch (error) {
        console.error("Error writing service offers file:", error);
    }
};
let serviceOffers = readServiceOffers();

// --- Messages Data ---
const MESSAGES_FILE = path.join(__dirname, 'src', 'services', 'messages.json');

const readMessages = () => {
    try {
        if (fs.existsSync(MESSAGES_FILE)) {
            const data = fs.readFileSync(MESSAGES_FILE);
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading messages file:", error);
    }
    return [];
};

const writeMessages = (messages) => {
    try {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    } catch (error) {
        console.error("Error writing messages file:", error);
    }
};
let messages = readMessages();


// POST /api/users/register
app.post('/api/users/register', async (req, res) => {
    const { Name, Email, Password } = req.body;

    if (!Name || !Email || !Password) {
        return res.status(400).json({ message: 'Name, Email, and Password are required' });
    }

    if (users.find(user => user.Email === Email)) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const HashedPassword = await bcrypt.hash(Password, 10);
    const newUser = {
        UserID: users.length > 0 ? Math.max(...users.map(u => u.UserID)) + 1 : 1, // Simple ID generation
        Name,
        Email,
        HashedPassword,
        ProfilePictureURL: '',
        Location: '',
        Bio: '',
        CreatedAt: new Date().toISOString(),
        LastLogin: null,
    };

    users.push(newUser);
    writeUsers(users);

    const { HashedPassword: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });
});

// POST /api/users/login
app.post('/api/users/login', async (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({ message: 'Email and Password are required' });
    }

    const user = users.find(user => user.Email === Email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(Password, user.HashedPassword);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.LastLogin = new Date().toISOString();
    writeUsers(users); // Update LastLogin time

    // In a real app, you'd return a JWT token here
    res.status(200).json({ message: 'Login successful', token: `mock-token-for-${user.UserID}` });
});

// GET /api/users/:userId/profile
app.get('/api/users/:userId/profile', (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const user = users.find(u => u.UserID === userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const { HashedPassword, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
});

// --- Service Request Endpoints ---

// POST /api/requests
app.post('/api/requests', (req, res) => {
    const { userId, title, description, category, location } = req.body;

    if (!userId || !title || !description || !category || !location) {
        return res.status(400).json({ message: 'Missing required fields for service request' });
    }

    // Basic validation: Check if user exists
    const userExists = users.some(u => u.UserID === parseInt(userId));
    if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
    }

    const newRequest = {
        RequestID: serviceRequests.length > 0 ? Math.max(...serviceRequests.map(r => r.RequestID)) + 1 : 1,
        UserID: parseInt(userId),
        Title: title,
        Description: description,
        Category: category,
        Location: location,
        Status: 'Open', // Default status
        CreatedAt: new Date().toISOString(),
        LastUpdatedAt: new Date().toISOString(),
    };

    serviceRequests.push(newRequest);
    writeServiceRequests(serviceRequests);
    res.status(201).json({ message: 'Service request created successfully', request: newRequest });
});

// GET /api/requests - Get all service requests
app.get('/api/requests', (req, res) => {
    // For now, returning all requests. Later, pagination might be needed.
    // We should also consider what details to return, especially if there's sensitive info.
    // For this stage, returning all details is fine.
    res.status(200).json(serviceRequests);
});

// --- Service Offer Endpoints ---

// POST /api/offers
app.post('/api/offers', (req, res) => {
    const { userId, title, description, category, serviceArea, availability } = req.body;

    if (!userId || !title || !description || !category || !serviceArea) { // Availability can be optional
        return res.status(400).json({ message: 'Missing required fields for service offer' });
    }

    // Basic validation: Check if user exists
    const userExists = users.some(u => u.UserID === parseInt(userId));
    if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
    }

    const newOffer = {
        OfferID: serviceOffers.length > 0 ? Math.max(...serviceOffers.map(o => o.OfferID)) + 1 : 1,
        UserID: parseInt(userId),
        Title: title,
        Description: description,
        Category: category,
        ServiceArea: serviceArea,
        Availability: availability || 'Not specified', // Default availability
        Status: 'Active', // Default status
        CreatedAt: new Date().toISOString(),
        LastUpdatedAt: new Date().toISOString(),
    };

    serviceOffers.push(newOffer);
    writeServiceOffers(serviceOffers);
    res.status(201).json({ message: 'Service offer created successfully', offer: newOffer });
});

// GET /api/offers - Get all service offers
app.get('/api/offers', (req, res) => {
    // Similar to GET /api/requests, returning all offers for now.
    res.status(200).json(serviceOffers);
});

// --- Matching Endpoint ---

// GET /api/matches?itemId=X&itemType=TYPE
app.get('/api/matches', (req, res) => {
    const { itemId, itemType } = req.query;

    if (!itemId || !itemType) {
        return res.status(400).json({ message: 'itemId and itemType query parameters are required' });
    }

    const id = parseInt(itemId);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'itemId must be a number' });
    }

    let matches = [];

    if (itemType === 'request') {
        const request = serviceRequests.find(r => r.RequestID === id);
        if (!request) {
            return res.status(404).json({ message: `Service request with ID ${id} not found` });
        }

        matches = serviceOffers.filter(offer => {
            // Basic category match (case-insensitive)
            const categoryMatch = offer.Category.toLowerCase() === request.Category.toLowerCase();
            // Basic location match (simple string inclusion, case-insensitive)
            const locationMatch = offer.ServiceArea.toLowerCase().includes(request.Location.toLowerCase()) ||
                                  request.Location.toLowerCase().includes(offer.ServiceArea.toLowerCase());
            // Ensure not by the same user
            const userMatch = offer.UserID !== request.UserID;
            // Ensure offer is active
            const statusMatch = offer.Status === 'Active';

            return categoryMatch && locationMatch && userMatch && statusMatch;
        });

    } else if (itemType === 'offer') {
        const offer = serviceOffers.find(o => o.OfferID === id);
        if (!offer) {
            return res.status(404).json({ message: `Service offer with ID ${id} not found` });
        }

        matches = serviceRequests.filter(request => {
            const categoryMatch = request.Category.toLowerCase() === offer.Category.toLowerCase();
            const locationMatch = request.Location.toLowerCase().includes(offer.ServiceArea.toLowerCase()) ||
                                  offer.ServiceArea.toLowerCase().includes(request.Location.toLowerCase());
            const userMatch = request.UserID !== offer.UserID;
            // Ensure request is open
            const statusMatch = request.Status === 'Open';
            
            return categoryMatch && locationMatch && userMatch && statusMatch;
        });
    } else {
        return res.status(400).json({ message: "itemType must be 'request' or 'offer'" });
    }

    res.status(200).json(matches);
});

// --- Messaging Endpoints ---

// POST /api/messages
app.post('/api/messages', (req, res) => {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ message: 'senderId, receiverId, and content are required' });
    }

    // Basic validation: Check if users exist
    const senderExists = users.some(u => u.UserID === parseInt(senderId));
    const receiverExists = users.some(u => u.UserID === parseInt(receiverId));
    if (!senderExists || !receiverExists) {
        return res.status(404).json({ message: 'Sender or Receiver user not found' });
    }
    if (senderId === receiverId) {
        return res.status(400).json({ message: 'Sender and Receiver cannot be the same user' });
    }


    const newMessage = {
        MessageID: messages.length > 0 ? Math.max(...messages.map(m => m.MessageID)) + 1 : 1,
        SenderUserID: parseInt(senderId),
        ReceiverUserID: parseInt(receiverId),
        MessageContent: content,
        SentAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    writeMessages(messages);
    res.status(201).json({ message: 'Message sent successfully', msg: newMessage });
});

// GET /api/messages?userId1=X&userId2=Y
app.get('/api/messages', (req, res) => {
    const { userId1, userId2 } = req.query;

    if (!userId1 || !userId2) {
        return res.status(400).json({ message: 'userId1 and userId2 query parameters are required' });
    }

    const uId1 = parseInt(userId1);
    const uId2 = parseInt(userId2);

    if (isNaN(uId1) || isNaN(uId2)) {
        return res.status(400).json({ message: 'User IDs must be numbers' });
    }

    const conversation = messages.filter(msg =>
        (msg.SenderUserID === uId1 && msg.ReceiverUserID === uId2) ||
        (msg.SenderUserID === uId2 && msg.ReceiverUserID === uId1)
    ).sort((a, b) => new Date(a.SentAt) - new Date(b.SentAt)); // Sort by SentAt ascending

    res.status(200).json(conversation);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    const servicesDir = path.join(__dirname, 'src', 'services');
    if (!fs.existsSync(servicesDir)) {
        fs.mkdirSync(servicesDir, { recursive: true });
    }

    // Initialize users.json
    if (!fs.existsSync(USERS_FILE) || fs.readFileSync(USERS_FILE, 'utf8').trim() === '') {
        writeUsers([]); users = []; console.log(`${USERS_FILE} created/initialized.`);
    } else {
        users = readUsers(); console.log(`${USERS_FILE} loaded.`);
    }

    // Initialize servicerequests.json
    if (!fs.existsSync(REQUESTS_FILE) || fs.readFileSync(REQUESTS_FILE, 'utf8').trim() === '') {
        writeServiceRequests([]); serviceRequests = []; console.log(`${REQUESTS_FILE} created/initialized.`);
    } else {
        serviceRequests = readServiceRequests(); console.log(`${REQUESTS_FILE} loaded.`);
    }

    // Initialize serviceoffers.json
    if (!fs.existsSync(OFFERS_FILE) || fs.readFileSync(OFFERS_FILE, 'utf8').trim() === '') {
        writeServiceOffers([]); serviceOffers = []; console.log(`${OFFERS_FILE} created/initialized.`);
    } else {
        serviceOffers = readServiceOffers(); console.log(`${OFFERS_FILE} loaded.`);
    }

    // Initialize messages.json
    if (!fs.existsSync(MESSAGES_FILE) || fs.readFileSync(MESSAGES_FILE, 'utf8').trim() === '') {
        writeMessages([]); messages = []; console.log(`${MESSAGES_FILE} created/initialized.`);
    } else {
        messages = readMessages(); console.log(`${MESSAGES_FILE} loaded.`);
    }
});
