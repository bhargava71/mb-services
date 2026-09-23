import mongoose from 'mongoose';
import Service from '../models/Service.js';

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = [
      {
        id: 'cooking',
        name: 'Cooking & Chef Services',
        slug: 'cooking',
        icon: 'Utensils',
        badge: 'Top Rated',
        tagline: 'Expert home chefs, daily meal prep & party catering',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
        subcategories: ['Daily Cook / Meal Prep', 'Party & Event Chef', 'North & South Indian Speciality'],
      },
      {
        id: 'home-cleaning',
        name: 'Home Cleaning',
        slug: 'home-cleaning',
        icon: 'Sparkles',
        badge: 'Up to 25% Off',
        tagline: 'Spotless homes with eco-friendly sanitization',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
        subcategories: ['Bathroom Cleaning', 'Full Home Deep Cleaning', 'Kitchen Degreasing', 'Sofa & Carpet Cleaning'],
      },
      {
        id: 'repairs',
        name: 'Repairs & Maintenance',
        slug: 'repairs',
        icon: 'Wrench',
        badge: 'Certified Experts',
        tagline: 'AC, Electrician, Carpentry & House Painting',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        subcategories: ['AC Service & Repair', 'Electrical Wiring & Fixes', 'Carpentry & Furniture', 'Wall Painting & House Touchup'],
      },
      {
        id: 'plumbing',
        name: 'Plumbing Solutions',
        slug: 'plumbing',
        icon: 'Droplets',
        badge: 'Express 30-min',
        tagline: 'Zero leakages, instant drain unclogging & pipe repairs',
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
        subcategories: [
          'Leak Detection & Pipe Repair',
          'Tap & Mixer Fixes',
          'Drain Unclogging',
          'Toilet & Sanitaryware',
          'Water Tank Cleaning',
          'Basin & Waste Pipe',
          'Geyser & Water Heater',
          'Motor & Pipeline',
        ],
      },
    ];

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching categories',
    });
  }
};

// @desc    Get all services (optional category or search query filter)
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { category: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const services = await Service.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Services fetched successfully',
      data: services,
    });
  } catch (error) {
    console.error('getServices error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching services',
    });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service details retrieved',
      data: service,
    });
  } catch (error) {
    console.error('getServiceById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching service',
    });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Admin only
export const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      subcategory,
      badge,
      rating,
      reviewCount,
      duration,
      shortDescription,
      fullDescription,
      whatsIncluded,
      whatsExcluded,
      addOns,
    } = req.body;

    if (!name || price === undefined || price === null || price === '') {
      return res.status(400).json({
        success: false,
        message: 'Service name and price are required',
      });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number',
      });
    }

    const service = await Service.create({
      name: name.trim(),
      description: description || '',
      price: parsedPrice,
      originalPrice: Number(originalPrice) || 0,
      image: image || '',
      category: category || 'General',
      subcategory: subcategory || '',
      badge: badge || '',
      rating: Number(rating) || 4.8,
      reviewCount: Number(reviewCount) || 1200,
      duration: Number(duration) || 45,
      shortDescription: shortDescription || '',
      fullDescription: fullDescription || '',
      whatsIncluded: Array.isArray(whatsIncluded) ? whatsIncluded : [],
      whatsExcluded: Array.isArray(whatsExcluded) ? whatsExcluded : [],
      addOns: Array.isArray(addOns) ? addOns : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    console.error('createService error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating service',
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Admin only
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      subcategory,
      badge,
      rating,
      reviewCount,
      duration,
      shortDescription,
      fullDescription,
      whatsIncluded,
      whatsExcluded,
      addOns,
    } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    if (name !== undefined) service.name = name.trim();
    if (description !== undefined) service.description = description;
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number',
        });
      }
      service.price = parsedPrice;
    }
    if (originalPrice !== undefined) service.originalPrice = Number(originalPrice);
    if (image !== undefined) service.image = image;
    if (category !== undefined) service.category = category;
    if (subcategory !== undefined) service.subcategory = subcategory;
    if (badge !== undefined) service.badge = badge;
    if (rating !== undefined) service.rating = Number(rating);
    if (reviewCount !== undefined) service.reviewCount = Number(reviewCount);
    if (duration !== undefined) service.duration = Number(duration);
    if (shortDescription !== undefined) service.shortDescription = shortDescription;
    if (fullDescription !== undefined) service.fullDescription = fullDescription;
    if (whatsIncluded !== undefined) service.whatsIncluded = whatsIncluded;
    if (whatsExcluded !== undefined) service.whatsExcluded = whatsExcluded;
    if (addOns !== undefined) service.addOns = addOns;

    await service.save();

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    console.error('updateService error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating service',
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Admin only
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    await Service.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('deleteService error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting service',
    });
  }
};
