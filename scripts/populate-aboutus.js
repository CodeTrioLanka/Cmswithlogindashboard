// Script to populate sample About Us data
const BASE_URL = 'http://localhost:5000';

const sampleData = {
    hero: {
        heroTitle: 'We Create Unforgettable Journeys',
        heroDescription: 'Discover the world with us and create memories that last a lifetime. Experience nature like never before with our expertly curated tours and adventures.',
        heroBackground: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' // Sample landscape image
    },
    stats: {
        yearExperience: 15,
        happyTravelers: 12500,
        toursCompleted: 2800,
        destination: 45
    },
    milestones: [
        {
            year: 2010,
            event: 'Company Founded',
            mstone_description: 'Started our journey with a vision to make nature accessible to everyone'
        },
        {
            year: 2015,
            event: 'Expanded to 20 Destinations',
            mstone_description: 'Reached a major milestone by offering tours across 20 beautiful locations'
        },
        {
            year: 2020,
            event: '10,000 Happy Travelers',
            mstone_description: 'Celebrated serving over 10,000 satisfied customers worldwide'
        },
        {
            year: 2024,
            event: 'Sustainability Initiative',
            mstone_description: 'Launched our eco-friendly tourism program to protect natural habitats'
        }
    ],
    values: [
        {
            icon: 'Heart',
            title: 'Customer First',
            description: 'We prioritize our customers\' satisfaction and safety above everything else',
            color: '#EF4444'
        },
        {
            icon: 'Leaf',
            title: 'Sustainability',
            description: 'Committed to eco-friendly practices and preserving natural beauty for future generations',
            color: '#10B981'
        },
        {
            icon: 'Shield',
            title: 'Safety & Security',
            description: 'Your safety is our top priority with certified guides and comprehensive insurance',
            color: '#3B82F6'
        },
        {
            icon: 'Star',
            title: 'Excellence',
            description: 'We strive for excellence in every tour, ensuring unforgettable experiences',
            color: '#F59E0B'
        }
    ],
    team: [
        {
            name: 'Sarah Johnson',
            role: 'CEO & Founder',
            bio: 'With 20 years of experience in tourism, Sarah founded Nature Escape to share her passion for adventure and nature conservation.',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'
        },
        {
            name: 'Michael Chen',
            role: 'Head of Operations',
            bio: 'Michael ensures every tour runs smoothly with his expertise in logistics and customer service excellence.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
        },
        {
            name: 'Emily Rodriguez',
            role: 'Lead Tour Guide',
            bio: 'Emily brings destinations to life with her extensive knowledge of local culture and natural history.',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'
        },
        {
            name: 'David Thompson',
            role: 'Sustainability Director',
            bio: 'David leads our eco-friendly initiatives, ensuring our tours have minimal environmental impact.',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'
        }
    ]
};

async function populateData() {
    try {
        console.log('🚀 Populating About Us data...');

        const response = await fetch(`${BASE_URL}/api/aboutus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sampleData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to create data: ${error.error || error.message}`);
        }

        const result = await response.json();
        console.log('✅ Success! About Us data created:');
        console.log(JSON.stringify(result, null, 2));
        console.log('\n📝 You can now view this data in your CMS at: http://localhost:5175');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

populateData();
