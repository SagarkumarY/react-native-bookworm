import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../models/Book.js';
import protectRoute from '../middleware/auth.protectRoute.js'; // Import your authentication middleware


const routes = express.Router();

routes.post('/', protectRoute, async (req, res) => {
    //authenticate middleware will verify the token and attach the user object to the request.
    const { title, caption, image, rating } = req.body;
    try {
        // Validate the data
        if (!title || !caption || !image || !rating) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (typeof rating !== 'number' || rating < 0 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 0 and 5' });
        }

        // Upload the image to Cloudinary
        const imageResponse = await cloudinary.uploader.upload(image);
        const imageUrl = imageResponse.secure_url;

        // Save the book to the database, associating it with the user
        const book = new Book({
            title,
            caption,
            image: imageUrl,
            rating,
            user: req.user._id, // Associate the book with the authenticated user
        });

        await book.save();

        res.status(201).json(book);
    } catch (error) {
        console.error('Error creating Book:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: Object.values(error.errors).map((val) => val.message).join(', ') });
        }
        if (error.name === 'CloudinaryError') {
            return res.status(500).json({ message: 'Cloudinary upload failed' });
        }

        res.status(500).json({ message: 'Server Error' });
    }
});

// fetch books from database

routes.get('/', protectRoute, async (req, res) => {
    try {
        // if the URL is /books?page=2&limit=10, then req.query.page would be "2".
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;
        //     If page is 1 and limit is 5, skip will be (1 - 1) * 5 = 0.
        //   If page is 2 and limit is 5, skip will be (2 - 1) * 5 = 5.
        //     If page is 3 and limit is 5, skip will be (3 - 1) * 5 = 10.
        const books = await Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "username profileImage")

        const total = await Book.countDocument();
        res.json({
            books,
            totalBooks: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// delete single book

routes.delete('/:id', protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // delete the image from cloudinary as well
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const cloudinaryId = book.image.split('/').pop().split(".")[0];
                await cloudinary.uploader.destroy(cloudinaryId)

            } catch (error) {
                console.error('Error deleting image from cloudinary:', error)
                return res.status(500).json({ message: 'Error deleting image from cloudinary' });
            }
        }

        await book.deleteOne();

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// get recommended books by the loged  in user
routes.get("/", protectRoute, async (req, res) => {

    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error('Error fetching recommended books:', error);
        res.status(500).json({ message: 'Server Error' });
    }
})

export default routes;