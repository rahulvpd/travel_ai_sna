import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import driver from '../config/database.js';

export const register = async (req, res) => {
    const session = driver.session();
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email }
        );

        if (existingUser.records.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await session.run(
            `CREATE (u:User {
                id: randomUUID(),
                name: $name,
                email: $email,
                passwordHash: $passwordHash,
                createdAt: datetime()
            })
            RETURN u`,
            { name, email, passwordHash }
        );

        const user = result.records[0].get('u').properties;

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    } finally {
        await session.close();
    }
};

export const login = async (req, res) => {
    const session = driver.session();
    try {
        const { email, password } = req.body;

        // Find user
        const result = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email }
        );

        if (result.records.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.records[0].get('u').properties;

        // Check password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    } finally {
        await session.close();
    }
};

export const getMe = async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(
            'MATCH (u:User {id: $userId}) RETURN u',
            { userId: req.userId }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.records[0].get('u').properties;
        res.json({
            id: user.id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    } finally {
        await session.close();
    }
};
