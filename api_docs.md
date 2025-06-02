# API Documentation for The Local Assist PWA

This document outlines the API endpoints for user management.

## Base URL

All API endpoints are prefixed with `/api`.

## User Management

### 1. Register User

*   **Endpoint:** `POST /users/register`
*   **Description:** Registers a new user.
*   **Request Body (JSON):**
    ```json
    {
        "Name": "John Doe",
        "Email": "john.doe@example.com",
        "Password": "securepassword123"
    }
    ```
*   **Success Response (201):**
    *   **Body (JSON):**
        ```json
        {
            "message": "User registered successfully",
            "user": {
                "UserID": 1,
                "Name": "John Doe",
                "Email": "john.doe@example.com",
                "ProfilePictureURL": "",
                "Location": "",
                "Bio": "",
                "CreatedAt": "2023-10-27T10:00:00.000Z",
                "LastLogin": null
            }
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If Name, Email, or Password are not provided.
        ```json
        {
            "message": "Name, Email, and Password are required"
        }
        ```
    *   `400 Bad Request`: If the email already exists.
        ```json
        {
            "message": "Email already exists"
        }
        ```

## Direct Messaging

### 1. Send Message

*   **Endpoint:** `POST /api/messages`
*   **Description:** Sends a direct message from one user to another.
*   **Request Body (JSON):**
    ```json
    {
        "senderId": 1,
        "receiverId": 2,
        "content": "Hello, I'm interested in your gardening offer."
    }
    ```
*   **Success Response (201):**
    *   **Body (JSON):**
        ```json
        {
            "message": "Message sent successfully",
            "msg": {
                "MessageID": 1,
                "SenderUserID": 1,
                "ReceiverUserID": 2,
                "MessageContent": "Hello, I'm interested in your gardening offer.",
                "SentAt": "2023-10-31T10:00:00.000Z"
            }
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `senderId`, `receiverId`, or `content` are missing.
        ```json
        {
            "message": "senderId, receiverId, and content are required"
        }
        ```
    *   `400 Bad Request`: If `senderId` and `receiverId` are the same.
        ```json
        {
            "message": "Sender and Receiver cannot be the same user"
        }
        ```
    *   `404 Not Found`: If `senderId` or `receiverId` does not correspond to an existing user.
        ```json
        {
            "message": "Sender or Receiver user not found"
        }
        ```

### 2. Get Conversation

*   **Endpoint:** `GET /api/messages`
*   **Description:** Retrieves the conversation history between two users, sorted by time.
*   **Query Parameters:**
    *   `userId1` (integer, required): The ID of the first user.
    *   `userId2` (integer, required): The ID of the second user.
*   **Success Response (200):**
    *   **Body (JSON):** An array of message objects, sorted by `SentAt` timestamp in ascending order.
        ```json
        [
            {
                "MessageID": 1,
                "SenderUserID": 1,
                "ReceiverUserID": 2,
                "MessageContent": "Hello, I'm interested in your gardening offer.",
                "SentAt": "2023-10-31T10:00:00.000Z"
            },
            {
                "MessageID": 2,
                "SenderUserID": 2,
                "ReceiverUserID": 1,
                "MessageContent": "Great! When are you available to discuss?",
                "SentAt": "2023-10-31T10:05:00.000Z"
            }
            // ... other messages in the conversation
        ]
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `userId1` or `userId2` are missing or not numbers.
        ```json
        {
            "message": "userId1 and userId2 query parameters are required"
        }
        ```
        ```json
        {
            "message": "User IDs must be numbers"
        }
        ```

### 2. Login User

*   **Endpoint:** `POST /users/login`
*   **Description:** Logs in an existing user.
*   **Request Body (JSON):**
    ```json
    {
        "Email": "john.doe@example.com",
        "Password": "securepassword123"
    }
    ```
*   **Success Response (200):**
    *   **Body (JSON):**
        ```json
        {
            "message": "Login successful",
            "token": "mock-token-for-1" 
        }
        ```
        *(Note: The token is a placeholder for this stage.)*
*   **Error Responses:**
    *   `400 Bad Request`: If Email or Password are not provided.
        ```json
        {
            "message": "Email and Password are required"
        }
        ```
    *   `401 Unauthorized`: If credentials are invalid.
        ```json
        {
            "message": "Invalid credentials"
        }
        ```

### 3. Get User Profile

*   **Endpoint:** `GET /users/:userId/profile`
*   **Description:** Retrieves the profile information for a specific user.
*   **URL Parameters:**
    *   `userId` (integer): The ID of the user.
*   **Success Response (200):**
    *   **Body (JSON):**
        ```json
        {
            "UserID": 1,
            "Name": "John Doe",
            "Email": "john.doe@example.com",
            "ProfilePictureURL": "",
            "Location": "",
            "Bio": "",
            "CreatedAt": "2023-10-27T10:00:00.000Z",
            "LastLogin": "2023-10-27T12:00:00.000Z"
        }
        ```
*   **Error Responses:**
    *   `404 Not Found`: If the user with the specified ID does not exist.
        ```json
        {
            "message": "User not found"
        }
        ```

## Matching Service Requests and Offers

### 1. Find Matches for a Service Item

*   **Endpoint:** `GET /api/matches`
*   **Description:** Finds potential matches (offers for a request, or requests for an offer) based on category and location overlap.
*   **Query Parameters:**
    *   `itemId` (integer, required): The ID of the service request or service offer to find matches for.
    *   `itemType` (string, required): The type of the item. Must be either `'request'` (to find matching offers) or `'offer'` (to find matching requests).
*   **Success Response (200):**
    *   **Body (JSON):** An array of matching service offer objects (if `itemType` was 'request') or service request objects (if `itemType` was 'offer').
    *   **Example (Matches for a Request):**
        ```json
        [
            {
                "OfferID": 2,
                "UserID": 3, // Different from the request's UserID
                "Title": "Gardening Services Available",
                "Description": "I can help with lawn mowing, weeding, and planting.",
                "Category": "Gardening", // Matches request's category
                "ServiceArea": "Anytown West", // Overlaps with request's location
                "Availability": "Weekends",
                "Status": "Active",
                "CreatedAt": "2023-10-29T14:00:00.000Z",
                "LastUpdatedAt": "2023-10-29T14:00:00.000Z"
            }
            // ... other matching offers
        ]
        ```
    *   **Example (Matches for an Offer):**
        ```json
        [
            {
                "RequestID": 5,
                "UserID": 4, // Different from the offer's UserID
                "Title": "Need lawn mowing",
                "Description": "My lawn needs to be mowed this week.",
                "Category": "Gardening", // Matches offer's category
                "Location": "123 Oak St, Anytown West", // Overlaps with offer's service area
                "Status": "Open",
                "CreatedAt": "2023-10-30T09:00:00.000Z",
                "LastUpdatedAt": "2023-10-30T09:00:00.000Z"
            }
            // ... other matching requests
        ]
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `itemId` or `itemType` are missing or invalid.
        ```json
        {
            "message": "itemId and itemType query parameters are required"
        }
        ```
        ```json
        {
            "message": "itemId must be a number"
        }
        ```
        ```json
        {
            "message": "itemType must be 'request' or 'offer'"
        }
        ```
    *   `404 Not Found`: If the specified `itemId` (for the given `itemType`) does not exist.
        ```json
        {
            "message": "Service request with ID X not found" 
        }
        ```
        ```json
        {
            "message": "Service offer with ID Y not found"
        }
        ```

## Data Storage

User data, service requests, and service offers are currently stored in JSON files within the `src/services/` directory (e.g., `users.json`, `servicerequests.json`, `serviceoffers.json`). This is for initial development purposes and will be replaced by a proper database.
The `HashedPassword` field for users is stored but never returned in API responses.

## Service Request Management

### 1. Create Service Request

*   **Endpoint:** `POST /api/requests`
*   **Description:** Creates a new service request.
*   **Assumptions:** The `userId` is sent in the request body. In a real application, this would typically be derived from an authentication token.
*   **Request Body (JSON):**
    ```json
    {
        "userId": 1,
        "title": "Need help moving a couch",
        "description": "Looking for someone strong to help me move a couch to my new apartment.",
        "category": "Moving",
        "location": "123 Main St, Anytown"
    }
    ```
*   **Success Response (201):**
    *   **Body (JSON):**
        ```json
        {
            "message": "Service request created successfully",
            "request": {
                "RequestID": 1,
                "UserID": 1,
                "Title": "Need help moving a couch",
                "Description": "Looking for someone strong to help me move a couch to my new apartment.",
                "Category": "Moving",
                "Location": "123 Main St, Anytown",
                "Status": "Open",
                "CreatedAt": "2023-10-28T10:00:00.000Z",
                "LastUpdatedAt": "2023-10-28T10:00:00.000Z"
            }
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If required fields are missing.
        ```json
        {
            "message": "Missing required fields for service request"
        }
        ```
    *   `404 Not Found`: If the `userId` does not correspond to an existing user.
        ```json
        {
            "message": "User not found"
        }
        ```

### 2. Get All Service Requests

*   **Endpoint:** `GET /api/requests`
*   **Description:** Retrieves a list of all service requests.
*   **Success Response (200):**
    *   **Body (JSON):** An array of service request objects.
        ```json
        [
            {
                "RequestID": 1,
                "UserID": 1,
                "Title": "Need help moving a couch",
                "Description": "Looking for someone strong to help me move a couch to my new apartment.",
                "Category": "Moving",
                "Location": "123 Main St, Anytown",
                "Status": "Open",
                "CreatedAt": "2023-10-28T10:00:00.000Z",
                "LastUpdatedAt": "2023-10-28T10:00:00.000Z"
            }
            // ... other requests
        ]
        ```
*   **Error Responses:** None specific, typically returns an empty array if no requests exist.

## Service Offer Management

### 1. Create Service Offer

*   **Endpoint:** `POST /api/offers`
*   **Description:** Creates a new service offer.
*   **Assumptions:** The `userId` is sent in the request body.
*   **Request Body (JSON):**
    ```json
    {
        "userId": 2,
        "title": "Expert Web Development Services",
        "description": "Offering professional web development with React and Node.js.",
        "category": "Web Development",
        "serviceArea": "Remote",
        "availability": "Weekdays, 9 AM - 5 PM"
    }
    ```
*   **Success Response (201):**
    *   **Body (JSON):**
        ```json
        {
            "message": "Service offer created successfully",
            "offer": {
                "OfferID": 1,
                "UserID": 2,
                "Title": "Expert Web Development Services",
                "Description": "Offering professional web development with React and Node.js.",
                "Category": "Web Development",
                "ServiceArea": "Remote",
                "Availability": "Weekdays, 9 AM - 5 PM",
                "Status": "Active",
                "CreatedAt": "2023-10-28T11:00:00.000Z",
                "LastUpdatedAt": "2023-10-28T11:00:00.000Z"
            }
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If required fields are missing (availability is optional).
        ```json
        {
            "message": "Missing required fields for service offer"
        }
        ```
    *   `404 Not Found`: If the `userId` does not correspond to an existing user.
        ```json
        {
            "message": "User not found"
        }
        ```
