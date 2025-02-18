//connect to db using prisma and get user
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

interface User {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    role: string;
    active: boolean;
    // Add other user fields as necessary
}

export const getUserFromDb = async (email: string, password: string): Promise<User | null> => {
    const user = await db.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return null;
    }

    // Assuming you have a function to verify the password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        active: user.active,
        // Add other user fields as necessary
    };
};

// Dummy function to simulate password verification
const verifyPassword = async (password: string, passwordHash: string): Promise<boolean> => {
    // Implement your password verification logic here
    return password === passwordHash; // Replace with actual verification logic
};