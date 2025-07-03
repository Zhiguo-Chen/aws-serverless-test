export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Optional for security reasons, should not be returned in API responses
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  isAdmin?: boolean;
  isSeller?: boolean; // Indicates if the user is a seller
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  profilePictureUrl?: string; // URL to the user's profile picture
  shippingAddress?: {
    street: string;
    city: string;
    country: string;
    zip: string;
  };
}
