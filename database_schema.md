# Database Schema for The Local Assist PWA

## Table: UserProfiles

| Field             | Data Type     | Constraints       | Description                                   |
|-------------------|---------------|-------------------|-----------------------------------------------|
| UserID            | INTEGER       | PRIMARY KEY       | Unique identifier for the user.               |
| Name              | VARCHAR(255)  | NOT NULL          | User's full name.                             |
| Email             | VARCHAR(255)  | UNIQUE, NOT NULL  | User's email address.                         |
| PhoneNumber       | VARCHAR(20)   |                   | User's phone number (optional).               |
| HashedPassword    | VARCHAR(255)  | NOT NULL          | Hashed password for user authentication.      |
| ProfilePictureURL | TEXT          |                   | URL to the user's profile picture (optional). |
| Location          | TEXT          |                   | User's general location or address.           |
| Bio               | TEXT          |                   | Short biography of the user (optional).       |
| CreatedAt         | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Date and time of account creation.        |
| LastLogin         | TIMESTAMP     |                   | Date and time of the user's last login.       |

## Table: ServiceRequests

| Field         | Data Type     | Constraints       | Description                                       |
|---------------|---------------|-------------------|---------------------------------------------------|
| RequestID     | INTEGER       | PRIMARY KEY       | Unique identifier for the service request.        |
| UserID        | INTEGER       | FOREIGN KEY (UserProfiles.UserID) | ID of the user who created the request.        |
| Title         | VARCHAR(255)  | NOT NULL          | Title of the service request.                     |
| Description   | TEXT          | NOT NULL          | Detailed description of the service needed.       |
| Category      | VARCHAR(100)  | NOT NULL          | Category of the service (e.g., Plumbing, Tutoring).|
| Location      | TEXT          | NOT NULL          | Location where the service is needed.             |
| Status        | VARCHAR(50)   | NOT NULL          | Current status (e.g., Open, InProgress, Completed). |
| CreatedAt     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Date and time of request creation.            |
| LastUpdatedAt | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Date and time of the last update to the request. |

## Table: ServiceOffers

| Field         | Data Type     | Constraints       | Description                                       |
|---------------|---------------|-------------------|---------------------------------------------------|
| OfferID       | INTEGER       | PRIMARY KEY       | Unique identifier for the service offer.          |
| UserID        | INTEGER       | FOREIGN KEY (UserProfiles.UserID) | ID of the user offering the service.           |
| Title         | VARCHAR(255)  | NOT NULL          | Title of the service being offered.               |
| Description   | TEXT          | NOT NULL          | Detailed description of the service offered.      |
| Category      | VARCHAR(100)  | NOT NULL          | Category of the service (e.g., Plumbing, Tutoring).|
| ServiceArea   | TEXT          | NOT NULL          | Geographic area where the service is offered.     |
| Availability  | TEXT          |                   | User's availability (e.g., Weekends, Evenings).   |
| Status        | VARCHAR(50)   | NOT NULL          | Current status (e.g., Active, Paused).            |
| CreatedAt     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Date and time of offer creation.              |
| LastUpdatedAt | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Date and time of the last update to the offer.   |

## Table: Messages

| Field           | Data Type     | Constraints       | Description                                   |
|-----------------|---------------|-------------------|-----------------------------------------------|
| MessageID       | INTEGER       | PRIMARY KEY       | Unique identifier for the message.            |
| SenderUserID    | INTEGER       | FOREIGN KEY (UserProfiles.UserID) | ID of the user who sent the message.         |
| ReceiverUserID  | INTEGER       | FOREIGN KEY (UserProfiles.UserID) | ID of the user who received the message.       |
| MessageContent  | TEXT          | NOT NULL          | Content of the message.                       |
| SentAt          | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Date and time the message was sent.           |
