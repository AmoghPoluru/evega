import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

// ==================== CATEGORIES DATA ====================
const categories = [
  {
    name: "All",
    slug: "all",
  },
  {
    name: "Business & Money",
    color: "#FFB347",
    slug: "business-money",
    subcategories: [
      { name: "Accounting", slug: "accounting" },
      {
        name: "Entrepreneurship",
        slug: "entrepreneurship",
      },
      { name: "Gigs & Side Projects", slug: "gigs-side-projects" },
      { name: "Investing", slug: "investing" },
      { name: "Management & Leadership", slug: "management-leadership" },
      {
        name: "Marketing & Sales",
        slug: "marketing-sales",
      },
      { name: "Networking, Careers & Jobs", slug: "networking-careers-jobs" },
      { name: "Personal Finance", slug: "personal-finance" },
      { name: "Real Estate", slug: "real-estate" },
    ],
  },
  {
    name: "Software Development",
    color: "#7EC8E3",
    slug: "software-development",
    subcategories: [
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile Development", slug: "mobile-development" },
      { name: "Game Development", slug: "game-development" },
      { name: "Programming Languages", slug: "programming-languages" },
      { name: "DevOps", slug: "devops" },
    ],
  },
  {
    name: "Writing & Publishing",
    color: "#D8B5FF",
    slug: "writing-publishing",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Blogging", slug: "blogging" },
      { name: "Copywriting", slug: "copywriting" },
      { name: "Self-Publishing", slug: "self-publishing" },
    ],
  },
  {
    name: "Other",
    slug: "other",
  },
  {
    name: "Education",
    color: "#FFE066",
    slug: "education",
    subcategories: [
      { name: "Online Courses", slug: "online-courses" },
      { name: "Tutoring", slug: "tutoring" },
      { name: "Test Preparation", slug: "test-preparation" },
      { name: "Language Learning", slug: "language-learning" },
    ],
  },
  {
    name: "Self Improvement",
    color: "#96E6B3",
    slug: "self-improvement",
    subcategories: [
      { name: "Productivity", slug: "productivity" },
      { name: "Personal Development", slug: "personal-development" },
      { name: "Mindfulness", slug: "mindfulness" },
      { name: "Career Growth", slug: "career-growth" },
    ],
  },
  {
    name: "Fitness & Health",
    color: "#FF9AA2",
    slug: "fitness-health",
    subcategories: [
      { name: "Workout Plans", slug: "workout-plans" },
      { name: "Nutrition", slug: "nutrition" },
      { name: "Mental Health", slug: "mental-health" },
      { name: "Yoga", slug: "yoga" },
    ],
  },
  {
    name: "Design",
    color: "#B5B9FF",
    slug: "design",
    subcategories: [
      { name: "UI/UX", slug: "ui-ux" },
      { name: "Graphic Design", slug: "graphic-design" },
      { name: "3D Modeling", slug: "3d-modeling" },
      { name: "Typography", slug: "typography" },
    ],
  },
  {
    name: "Drawing & Painting",
    color: "#FFCAB0",
    slug: "drawing-painting",
    subcategories: [
      { name: "Watercolor", slug: "watercolor" },
      { name: "Acrylic", slug: "acrylic" },
      { name: "Oil", slug: "oil" },
      { name: "Pastel", slug: "pastel" },
      { name: "Charcoal", slug: "charcoal" },
    ],
  },
  {
    name: "Music",
    color: "#FFD700",
    slug: "music",
    subcategories: [
      { name: "Songwriting", slug: "songwriting" },
      { name: "Music Production", slug: "music-production" },
      { name: "Music Theory", slug: "music-theory" },
      { name: "Music History", slug: "music-history" },
    ],
  },
  {
    name: "Photography",
    color: "#FF6B6B",
    slug: "photography",
    subcategories: [
      { name: "Portrait", slug: "portrait" },
      { name: "Landscape", slug: "landscape" },
      { name: "Street Photography", slug: "street-photography" },
      { name: "Nature", slug: "nature" },
      { name: "Macro", slug: "macro" },
    ],
  },
];

// ==================== PRODUCTS DATA ====================
const products = [
  {
    name: "Complete Web Development Course",
    description: "Learn full-stack web development from scratch. Includes HTML, CSS, JavaScript, React, Node.js, and more.",
    price: 99.99,
    categorySlug: "software-development",
    subcategorySlug: "web-development",
    refundPolicy: "30-day",
  },
  {
    name: "React Masterclass",
    description: "Advanced React patterns, hooks, context, and best practices for building scalable applications.",
    price: 79.99,
    categorySlug: "software-development",
    subcategorySlug: "web-development",
    refundPolicy: "30-day",
  },
  {
    name: "Mobile App Development Guide",
    description: "Build iOS and Android apps with React Native. Complete guide from setup to deployment.",
    price: 89.99,
    categorySlug: "software-development",
    subcategorySlug: "mobile-development",
    refundPolicy: "30-day",
  },
  {
    name: "Game Development Fundamentals",
    description: "Learn game development with Unity and C#. Create your first game from scratch.",
    price: 119.99,
    categorySlug: "software-development",
    subcategorySlug: "game-development",
    refundPolicy: "30-day",
  },
  {
    name: "Python Programming Bootcamp",
    description: "Master Python programming from basics to advanced topics. Perfect for beginners and intermediate developers.",
    price: 69.99,
    categorySlug: "software-development",
    subcategorySlug: "programming-languages",
    refundPolicy: "30-day",
  },
  {
    name: "DevOps Complete Guide",
    description: "Learn Docker, Kubernetes, CI/CD, and cloud deployment strategies.",
    price: 149.99,
    categorySlug: "software-development",
    subcategorySlug: "devops",
    refundPolicy: "30-day",
  },
  {
    name: "Business Plan Template Pack",
    description: "Professional business plan templates, financial models, and step-by-step guides.",
    price: 49.99,
    categorySlug: "business-money",
    subcategorySlug: "entrepreneurship",
    refundPolicy: "14-day",
  },
  {
    name: "Investment Strategies Guide",
    description: "Learn proven investment strategies for wealth building. Stocks, bonds, real estate, and more.",
    price: 129.99,
    categorySlug: "business-money",
    subcategorySlug: "investing",
    refundPolicy: "30-day",
  },
  {
    name: "Marketing Mastery Course",
    description: "Digital marketing, SEO, social media marketing, and email campaigns.",
    price: 89.99,
    categorySlug: "business-money",
    subcategorySlug: "marketing-sales",
    refundPolicy: "30-day",
  },
  {
    name: "Leadership Excellence",
    description: "Develop leadership skills, team management, and organizational strategies.",
    price: 99.99,
    categorySlug: "business-money",
    subcategorySlug: "management-leadership",
    refundPolicy: "30-day",
  },
  {
    name: "Accounting Basics for Entrepreneurs",
    description: "Learn essential accounting principles, bookkeeping, and financial statements for your business.",
    price: 59.99,
    categorySlug: "business-money",
    subcategorySlug: "accounting",
    refundPolicy: "30-day",
  },
  {
    name: "Side Hustle Success Guide",
    description: "Start and scale profitable side projects while working full-time. Real strategies from successful entrepreneurs.",
    price: 49.99,
    categorySlug: "business-money",
    subcategorySlug: "gigs-side-projects",
    refundPolicy: "14-day",
  },
  {
    name: "Career Networking Mastery",
    description: "Build meaningful professional relationships and advance your career through strategic networking.",
    price: 69.99,
    categorySlug: "business-money",
    subcategorySlug: "networking-careers-jobs",
    refundPolicy: "30-day",
  },
  {
    name: "Personal Finance Blueprint",
    description: "Master budgeting, saving, investing, and building wealth. Complete financial planning guide.",
    price: 79.99,
    categorySlug: "business-money",
    subcategorySlug: "personal-finance",
    refundPolicy: "30-day",
  },
  {
    name: "Real Estate Investment Guide",
    description: "Learn how to invest in real estate, analyze properties, and build a profitable portfolio.",
    price: 149.99,
    categorySlug: "business-money",
    subcategorySlug: "real-estate",
    refundPolicy: "30-day",
  },
  {
    name: "Vue.js Complete Course",
    description: "Master Vue.js framework from basics to advanced. Build modern web applications with Vue 3.",
    price: 89.99,
    categorySlug: "software-development",
    subcategorySlug: "web-development",
    refundPolicy: "30-day",
  },
  {
    name: "Next.js Full Stack Development",
    description: "Build production-ready full-stack applications with Next.js, React, and TypeScript.",
    price: 109.99,
    categorySlug: "software-development",
    subcategorySlug: "web-development",
    refundPolicy: "30-day",
  },
  {
    name: "Flutter Mobile Development",
    description: "Create beautiful cross-platform mobile apps with Flutter and Dart.",
    price: 94.99,
    categorySlug: "software-development",
    subcategorySlug: "mobile-development",
    refundPolicy: "30-day",
  },
  {
    name: "Swift iOS Development",
    description: "Build native iOS apps with Swift and SwiftUI. From beginner to App Store deployment.",
    price: 119.99,
    categorySlug: "software-development",
    subcategorySlug: "mobile-development",
    refundPolicy: "30-day",
  },
  {
    name: "Unreal Engine Game Development",
    description: "Create stunning 3D games with Unreal Engine 5. Learn Blueprints and C++ game programming.",
    price: 139.99,
    categorySlug: "software-development",
    subcategorySlug: "game-development",
    refundPolicy: "30-day",
  },
  {
    name: "JavaScript Mastery",
    description: "Deep dive into JavaScript ES6+, async programming, and modern JavaScript patterns.",
    price: 79.99,
    categorySlug: "software-development",
    subcategorySlug: "programming-languages",
    refundPolicy: "30-day",
  },
  {
    name: "Java Programming Complete",
    description: "Master Java programming, Spring Framework, and enterprise application development.",
    price: 99.99,
    categorySlug: "software-development",
    subcategorySlug: "programming-languages",
    refundPolicy: "30-day",
  },
  {
    name: "AWS Cloud Architecture",
    description: "Design and deploy scalable cloud infrastructure on AWS. Learn EC2, S3, Lambda, and more.",
    price: 159.99,
    categorySlug: "software-development",
    subcategorySlug: "devops",
    refundPolicy: "30-day",
  },
  {
    name: "Creative Writing Workshop",
    description: "Unlock your creative potential. Learn storytelling, character development, and narrative techniques.",
    price: 69.99,
    categorySlug: "writing-publishing",
    subcategorySlug: "fiction",
    refundPolicy: "30-day",
  },
  {
    name: "Memoir Writing Guide",
    description: "Write and publish your life story. Learn memoir writing techniques and publishing strategies.",
    price: 59.99,
    categorySlug: "writing-publishing",
    subcategorySlug: "non-fiction",
    refundPolicy: "30-day",
  },
  {
    name: "Blogging for Profit",
    description: "Start a profitable blog. Learn content creation, SEO, monetization, and audience building.",
    price: 49.99,
    categorySlug: "writing-publishing",
    subcategorySlug: "blogging",
    refundPolicy: "14-day",
  },
  {
    name: "Copywriting Secrets",
    description: "Master persuasive copywriting. Write copy that converts and drives sales.",
    price: 89.99,
    categorySlug: "writing-publishing",
    subcategorySlug: "copywriting",
    refundPolicy: "30-day",
  },
  {
    name: "Self-Publishing Success",
    description: "Publish your book on Amazon, Apple Books, and more. Complete guide to self-publishing.",
    price: 79.99,
    categorySlug: "writing-publishing",
    subcategorySlug: "self-publishing",
    refundPolicy: "30-day",
  },
  {
    name: "Online Course Creation Mastery",
    description: "Create and sell profitable online courses. Platform setup, content creation, and marketing.",
    price: 129.99,
    categorySlug: "education",
    subcategorySlug: "online-courses",
    refundPolicy: "30-day",
  },
  {
    name: "Tutoring Business Guide",
    description: "Start and grow a successful tutoring business. Find students, set rates, and scale your practice.",
    price: 59.99,
    categorySlug: "education",
    subcategorySlug: "tutoring",
    refundPolicy: "14-day",
  },
  {
    name: "SAT/ACT Prep Complete",
    description: "Comprehensive test preparation for SAT and ACT. Strategies, practice tests, and study plans.",
    price: 99.99,
    categorySlug: "education",
    subcategorySlug: "test-preparation",
    refundPolicy: "30-day",
  },
  {
    name: "Spanish Fluency Course",
    description: "Learn Spanish from beginner to fluent. Interactive lessons, pronunciation, and conversation practice.",
    price: 89.99,
    categorySlug: "education",
    subcategorySlug: "language-learning",
    refundPolicy: "30-day",
  },
  {
    name: "Productivity System Blueprint",
    description: "Build a productivity system that works. Time management, task organization, and workflow optimization.",
    price: 69.99,
    categorySlug: "self-improvement",
    subcategorySlug: "productivity",
    refundPolicy: "30-day",
  },
  {
    name: "Personal Development Masterclass",
    description: "Transform your life with proven personal development strategies. Goal setting, habits, and mindset.",
    price: 79.99,
    categorySlug: "self-improvement",
    subcategorySlug: "personal-development",
    refundPolicy: "30-day",
  },
  {
    name: "Meditation & Mindfulness Guide",
    description: "Learn meditation techniques, mindfulness practices, and stress reduction methods.",
    price: 49.99,
    categorySlug: "self-improvement",
    subcategorySlug: "mindfulness",
    refundPolicy: "30-day",
  },
  {
    name: "Career Advancement Strategies",
    description: "Accelerate your career growth. Negotiation, skill development, and promotion strategies.",
    price: 89.99,
    categorySlug: "self-improvement",
    subcategorySlug: "career-growth",
    refundPolicy: "30-day",
  },
  {
    name: "12-Week Workout Program",
    description: "Complete workout program for strength and muscle building. Includes nutrition guide and progress tracking.",
    price: 59.99,
    categorySlug: "fitness-health",
    subcategorySlug: "workout-plans",
    refundPolicy: "30-day",
  },
  {
    name: "Nutrition Science Guide",
    description: "Learn evidence-based nutrition principles. Meal planning, macros, and healthy eating strategies.",
    price: 69.99,
    categorySlug: "fitness-health",
    subcategorySlug: "nutrition",
    refundPolicy: "30-day",
  },
  {
    name: "Mental Health & Wellness",
    description: "Comprehensive guide to mental health, stress management, and emotional well-being.",
    price: 79.99,
    categorySlug: "fitness-health",
    subcategorySlug: "mental-health",
    refundPolicy: "30-day",
  },
  {
    name: "Yoga for Beginners",
    description: "Complete yoga course for beginners. Poses, breathing techniques, and meditation practices.",
    price: 49.99,
    categorySlug: "fitness-health",
    subcategorySlug: "yoga",
    refundPolicy: "30-day",
  },
  {
    name: "UI/UX Design Fundamentals",
    description: "Master user interface and user experience design. Wireframing, prototyping, and design systems.",
    price: 99.99,
    categorySlug: "design",
    subcategorySlug: "ui-ux",
    refundPolicy: "30-day",
  },
  {
    name: "Adobe Photoshop Mastery",
    description: "Learn professional photo editing and graphic design with Adobe Photoshop.",
    price: 89.99,
    categorySlug: "design",
    subcategorySlug: "graphic-design",
    refundPolicy: "30-day",
  },
  {
    name: "Blender 3D Modeling Course",
    description: "Create stunning 3D models and animations with Blender. From basics to advanced techniques.",
    price: 119.99,
    categorySlug: "design",
    subcategorySlug: "3d-modeling",
    refundPolicy: "30-day",
  },
  {
    name: "Typography & Font Design",
    description: "Learn typography principles, font pairing, and create custom typefaces.",
    price: 79.99,
    categorySlug: "design",
    subcategorySlug: "typography",
    refundPolicy: "30-day",
  },
  {
    name: "Watercolor Painting Techniques",
    description: "Master watercolor painting. Learn techniques, color mixing, and create beautiful artworks.",
    price: 69.99,
    categorySlug: "drawing-painting",
    subcategorySlug: "watercolor",
    refundPolicy: "30-day",
  },
  {
    name: "Acrylic Painting Workshop",
    description: "Learn acrylic painting from basics to advanced. Brush techniques, color theory, and composition.",
    price: 74.99,
    categorySlug: "drawing-painting",
    subcategorySlug: "acrylic",
    refundPolicy: "30-day",
  },
  {
    name: "Oil Painting Masterclass",
    description: "Traditional oil painting techniques. Learn from classical to modern approaches.",
    price: 89.99,
    categorySlug: "drawing-painting",
    subcategorySlug: "oil",
    refundPolicy: "30-day",
  },
  {
    name: "Pastel Drawing Guide",
    description: "Create vibrant pastel artworks. Learn blending, layering, and pastel techniques.",
    price: 64.99,
    categorySlug: "drawing-painting",
    subcategorySlug: "pastel",
    refundPolicy: "30-day",
  },
  {
    name: "Charcoal Portrait Drawing",
    description: "Master charcoal drawing techniques. Learn to create realistic portraits and figures.",
    price: 59.99,
    categorySlug: "drawing-painting",
    subcategorySlug: "charcoal",
    refundPolicy: "30-day",
  },
  {
    name: "Songwriting Mastery",
    description: "Write hit songs. Learn melody, lyrics, chord progressions, and song structure.",
    price: 79.99,
    categorySlug: "music",
    subcategorySlug: "songwriting",
    refundPolicy: "30-day",
  },
  {
    name: "Music Production with Ableton",
    description: "Produce professional music with Ableton Live. Mixing, mastering, and sound design.",
    price: 129.99,
    categorySlug: "music",
    subcategorySlug: "music-production",
    refundPolicy: "30-day",
  },
  {
    name: "Music Theory Complete",
    description: "Master music theory from basics to advanced. Scales, chords, harmony, and composition.",
    price: 89.99,
    categorySlug: "music",
    subcategorySlug: "music-theory",
    refundPolicy: "30-day",
  },
  {
    name: "History of Rock Music",
    description: "Explore the evolution of rock music from the 1950s to today. Artists, albums, and movements.",
    price: 49.99,
    categorySlug: "music",
    subcategorySlug: "music-history",
    refundPolicy: "30-day",
  },
  {
    name: "Portrait Photography Mastery",
    description: "Capture stunning portraits. Lighting, posing, composition, and post-processing techniques.",
    price: 99.99,
    categorySlug: "photography",
    subcategorySlug: "portrait",
    refundPolicy: "30-day",
  },
  {
    name: "Landscape Photography Guide",
    description: "Photograph breathtaking landscapes. Composition, golden hour, and nature photography tips.",
    price: 89.99,
    categorySlug: "photography",
    subcategorySlug: "landscape",
    refundPolicy: "30-day",
  },
  {
    name: "Street Photography Techniques",
    description: "Master candid street photography. Composition, timing, and storytelling in urban environments.",
    price: 79.99,
    categorySlug: "photography",
    subcategorySlug: "street-photography",
    refundPolicy: "30-day",
  },
  {
    name: "Nature Photography Workshop",
    description: "Capture wildlife and nature. Equipment, techniques, and ethical photography practices.",
    price: 94.99,
    categorySlug: "photography",
    subcategorySlug: "nature",
    refundPolicy: "30-day",
  },
  {
    name: "Macro Photography Masterclass",
    description: "Explore the world of macro photography. Equipment, techniques, and creative close-up shots.",
    price: 84.99,
    categorySlug: "photography",
    subcategorySlug: "macro",
    refundPolicy: "30-day",
  },
];

// ==================== TAGS DATA ====================
const tags = [
  "Beginner Friendly",
  "Advanced",
  "Best Seller",
  "New Release",
  "On Sale",
  "Video Course",
  "Interactive",
  "Certificate Included",
  "Lifetime Access",
  "Downloadable",
  "Web Development",
  "Mobile Development",
  "Programming",
  "Design",
  "Business",
  "Creative",
  "Technology",
  "Professional",
  "Self-Paced",
  "Instructor Led",
];

// Define tag assignments to products
const productTagAssignments: Record<string, string[]> = {
  "Complete Web Development Course": ["Beginner Friendly", "Best Seller", "Video Course", "Certificate Included", "Lifetime Access", "Web Development", "Programming"],
  "React Masterclass": ["Advanced", "Best Seller", "Video Course", "Web Development", "Programming", "Technology"],
  "Mobile App Development Guide": ["Beginner Friendly", "Video Course", "Mobile Development", "Programming", "Technology"],
  "Game Development Fundamentals": ["Beginner Friendly", "Video Course", "Creative", "Technology"],
  "Python Programming Bootcamp": ["Beginner Friendly", "Best Seller", "Video Course", "Programming", "Technology"],
  "DevOps Complete Guide": ["Advanced", "Video Course", "Professional", "Technology"],
  "Business Plan Template Pack": ["Beginner Friendly", "Downloadable", "Business", "Professional"],
  "Investment Strategies Guide": ["Advanced", "Best Seller", "Video Course", "Business", "Professional"],
  "Marketing Mastery Course": ["Best Seller", "Video Course", "Business", "Professional"],
  "Leadership Excellence": ["Advanced", "Video Course", "Business", "Professional"],
  "Accounting Basics for Entrepreneurs": ["Beginner Friendly", "Video Course", "Business", "Professional"],
  "Side Hustle Success Guide": ["Beginner Friendly", "Best Seller", "Video Course", "Business"],
  "Career Networking Mastery": ["Beginner Friendly", "Video Course", "Business", "Professional"],
  "Personal Finance Blueprint": ["Beginner Friendly", "Best Seller", "Video Course", "Business"],
  "Real Estate Investment Guide": ["Advanced", "Video Course", "Business", "Professional"],
  "Vue.js Complete Course": ["Beginner Friendly", "Video Course", "Web Development", "Programming", "Technology"],
  "Next.js Full Stack Development": ["Advanced", "New Release", "Video Course", "Web Development", "Programming", "Technology"],
  "Flutter Mobile Development": ["Beginner Friendly", "Video Course", "Mobile Development", "Programming", "Technology"],
  "Swift iOS Development": ["Advanced", "Video Course", "Mobile Development", "Programming", "Technology"],
  "Unreal Engine Game Development": ["Advanced", "Video Course", "Creative", "Technology"],
  "JavaScript Mastery": ["Advanced", "Best Seller", "Video Course", "Programming", "Technology"],
  "Java Programming Complete": ["Advanced", "Video Course", "Programming", "Technology", "Professional"],
  "AWS Cloud Architecture": ["Advanced", "Video Course", "Professional", "Technology"],
  "Creative Writing Workshop": ["Beginner Friendly", "Video Course", "Creative", "Self-Paced"],
  "Memoir Writing Guide": ["Beginner Friendly", "Video Course", "Creative", "Self-Paced"],
  "Blogging for Profit": ["Beginner Friendly", "Best Seller", "Video Course", "Business", "Creative"],
  "Copywriting Secrets": ["Advanced", "Best Seller", "Video Course", "Business", "Professional"],
  "Self-Publishing Success": ["Beginner Friendly", "Video Course", "Creative", "Business"],
  "Online Course Creation Mastery": ["Advanced", "Best Seller", "Video Course", "Business", "Professional"],
  "Tutoring Business Guide": ["Beginner Friendly", "Video Course", "Business"],
  "SAT/ACT Prep Complete": ["Beginner Friendly", "Best Seller", "Video Course", "Professional"],
  "Spanish Fluency Course": ["Beginner Friendly", "Video Course", "Interactive", "Self-Paced"],
  "Productivity System Blueprint": ["Beginner Friendly", "Best Seller", "Video Course", "Self-Paced"],
  "Personal Development Masterclass": ["Beginner Friendly", "Best Seller", "Video Course", "Self-Paced"],
  "Meditation & Mindfulness Guide": ["Beginner Friendly", "Video Course", "Self-Paced"],
  "Career Advancement Strategies": ["Advanced", "Video Course", "Business", "Professional"],
  "12-Week Workout Program": ["Beginner Friendly", "Video Course", "Self-Paced"],
  "Nutrition Science Guide": ["Beginner Friendly", "Video Course", "Self-Paced"],
  "Mental Health & Wellness": ["Beginner Friendly", "Video Course", "Self-Paced"],
  "Yoga for Beginners": ["Beginner Friendly", "Video Course", "Self-Paced"],
  "UI/UX Design Fundamentals": ["Beginner Friendly", "Best Seller", "Video Course", "Design", "Creative", "Technology"],
  "Adobe Photoshop Mastery": ["Advanced", "Best Seller", "Video Course", "Design", "Creative"],
  "Blender 3D Modeling Course": ["Advanced", "Video Course", "Design", "Creative", "Technology"],
  "Typography & Font Design": ["Advanced", "Video Course", "Design", "Creative"],
  "Watercolor Painting Techniques": ["Beginner Friendly", "Video Course", "Creative", "Self-Paced"],
  "Acrylic Painting Workshop": ["Beginner Friendly", "Video Course", "Creative", "Self-Paced"],
  "Oil Painting Masterclass": ["Advanced", "Video Course", "Creative", "Self-Paced"],
  "Pastel Drawing Guide": ["Beginner Friendly", "Video Course", "Creative", "Self-Paced"],
  "Charcoal Portrait Drawing": ["Advanced", "Video Course", "Creative", "Self-Paced"],
  "Songwriting Mastery": ["Beginner Friendly", "Video Course", "Creative", "Self-Paced"],
  "Music Production with Ableton": ["Advanced", "Video Course", "Creative", "Technology"],
  "Music Theory Complete": ["Beginner Friendly", "Video Course", "Creative", "Self-Paced"],
  "History of Rock Music": ["Beginner Friendly", "Video Course", "Creative", "Self-Paced"],
  "Portrait Photography Mastery": ["Advanced", "Video Course", "Creative", "Technology"],
  "Landscape Photography Guide": ["Beginner Friendly", "Best Seller", "Video Course", "Creative", "Technology"],
  "Street Photography Techniques": ["Advanced", "Video Course", "Creative", "Technology"],
  "Nature Photography Workshop": ["Beginner Friendly", "Video Course", "Creative", "Technology"],
  "Macro Photography Masterclass": ["Advanced", "Video Course", "Creative", "Technology"],
};

// ==================== SEED FUNCTIONS ====================

const seedAdminUser = async (payload: any) => {
  try {
    const existingUser = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: "admin@demo.com",
        },
      },
    });

    if (existingUser.docs.length === 0) {
      await payload.create({
        collection: "users",
        data: {
          email: "admin@demo.com",
          password: "password",
        },
      });
      console.log("✓ Admin user created: admin@demo.com");
    } else {
      console.log("⏭️  Admin user already exists: admin@demo.com");
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
};

const seedCategories = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Starting category seeding...");
  let categoriesCreated = 0;
  let categoriesSkipped = 0;
  let categoriesFailed = 0;

  for (const category of categories) {
    try {
      // Check if category already exists
      const existingCategory = await payload.find({
        collection: "categories",
        where: {
          slug: {
            equals: category.slug,
          },
        },
        limit: 1,
      });

      let parentCategory;
      if (existingCategory.docs.length > 0) {
        parentCategory = existingCategory.docs[0];
        categoriesSkipped++;
        console.log(`⏭️  Category already exists: ${category.name}`);
      } else {
        parentCategory = await payload.create({
          collection: "categories",
          data: {
            name: category.name,
            slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            color: category.color || null,
            parent: null,
          },
        });
        categoriesCreated++;
        console.log(`✓ Created category: ${category.name}`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      // Create subcategories
      for (const subCategory of category.subcategories || []) {
        try {
          const existingSubcategory = await payload.find({
            collection: "categories",
            where: {
              slug: {
                equals: subCategory.slug,
              },
              parent: {
                equals: parentCategory.id,
              },
            },
            limit: 1,
          });

          if (existingSubcategory.docs.length === 0) {
            await payload.create({
              collection: "categories",
              data: {
                name: subCategory.name,
                slug: subCategory.slug || subCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                parent: parentCategory.id,
              },
            });
            categoriesCreated++;
            console.log(`  ✓ Created subcategory: ${subCategory.name}`);
          } else {
            categoriesSkipped++;
            console.log(`  ⏭️  Subcategory already exists: ${subCategory.name}`);
          }

          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`  ❌ Error creating subcategory ${subCategory.name}:`, error);
          categoriesFailed++;
        }
      }
    } catch (error) {
      console.error(`❌ Error creating category ${category.name}:`, error);
      categoriesFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Category seeding completed!");
  console.log(`✓ Created: ${categoriesCreated}`);
  console.log(`⏭️  Skipped: ${categoriesSkipped}`);
  console.log(`❌ Failed: ${categoriesFailed}`);
  console.log("=".repeat(50));
};

const seedProducts = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Starting product seeding...");
  let productsCreated = 0;
  let productsSkipped = 0;
  let productsFailed = 0;

  for (const productData of products) {
    try {
      // Find category by slug
      const categoryResult = await payload.find({
        collection: "categories",
        where: {
          slug: {
            equals: productData.categorySlug,
          },
        },
        limit: 1,
      });

      const category = categoryResult.docs[0];
      if (!category) {
        console.error(`❌ Category not found: ${productData.categorySlug} for product: ${productData.name}`);
        productsFailed++;
        continue;
      }

      // Find subcategory by slug and parent
      const subcategoryResult = await payload.find({
        collection: "categories",
        where: {
          slug: {
            equals: productData.subcategorySlug,
          },
          parent: {
            equals: category.id,
          },
        },
        limit: 1,
      });

      const subcategory = subcategoryResult.docs[0];
      if (!subcategory) {
        console.error(`❌ Subcategory not found: ${productData.subcategorySlug} for category ${productData.categorySlug} - Product: ${productData.name}`);
        productsFailed++;
        continue;
      }

      // Check if product already exists
      const existingProduct = await payload.find({
        collection: "products",
        where: {
          name: {
            equals: productData.name,
          },
        },
        limit: 1,
      });

      if (existingProduct.docs.length > 0) {
        console.log(`⏭️  Product already exists: ${productData.name}`);
        productsSkipped++;
        continue;
      }

      // Create product
      await payload.create({
        collection: "products",
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: category.id,
          subcategory: subcategory.id,
          refundPolicy: productData.refundPolicy || "30-day",
          isPrivate: false,
          isArchived: false,
        },
      });

      productsCreated++;
      console.log(`✓ Created product: ${productData.name} ($${productData.price})`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error creating product ${productData.name}:`, error);
      productsFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Product seeding completed!");
  console.log(`✓ Created: ${productsCreated}`);
  console.log(`⏭️  Skipped: ${productsSkipped}`);
  console.log(`❌ Failed: ${productsFailed}`);
  console.log("=".repeat(50));
};

const seedTags = async (payload: any) => {
  console.log("\n" + "=".repeat(50));
  console.log("Starting tag seeding...");
  let tagsCreated = 0;
  let tagsSkipped = 0;
  let tagsFailed = 0;

  // Step 1: Create all tags
  const tagMap: Record<string, string> = {};

  for (const tagName of tags) {
    try {
      const existingTag = await payload.find({
        collection: "tags",
        where: {
          name: {
            equals: tagName,
          },
        },
        limit: 1,
      });

      if (existingTag.docs.length > 0) {
        tagMap[tagName] = existingTag.docs[0].id;
        tagsSkipped++;
        console.log(`⏭️  Tag already exists: ${tagName}`);
        continue;
      }

      const createdTag = await payload.create({
        collection: "tags",
        data: {
          name: tagName,
        },
      });

      tagMap[tagName] = createdTag.id;
      tagsCreated++;
      console.log(`✓ Created tag: ${tagName}`);

      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`❌ Error creating tag ${tagName}:`, error);
      tagsFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Tag creation completed!");
  console.log(`✓ Created: ${tagsCreated}`);
  console.log(`⏭️  Skipped: ${tagsSkipped}`);
  console.log(`❌ Failed: ${tagsFailed}`);
  console.log("=".repeat(50));

  // Step 2: Assign tags to products
  console.log("\nStarting tag assignment to products...");
  let productsUpdated = 0;
  let productsSkipped = 0;
  let productsFailed = 0;
  const tagToProductsMap: Record<string, string[]> = {};

  for (const [productName, tagNames] of Object.entries(productTagAssignments)) {
    try {
      const productResult = await payload.find({
        collection: "products",
        where: {
          name: {
            equals: productName,
          },
        },
        limit: 1,
      });

      if (productResult.docs.length === 0) {
        productsSkipped++;
        continue;
      }

      const product = productResult.docs[0];
      const tagIds = tagNames
        .map((tagName) => tagMap[tagName])
        .filter((id) => id !== undefined);

      if (tagIds.length === 0) {
        productsSkipped++;
        continue;
      }

      await payload.update({
        collection: "products",
        id: product.id,
        data: {
          tags: tagIds,
        },
      });

      tagNames.forEach((tagName) => {
        if (tagMap[tagName]) {
          if (!tagToProductsMap[tagName]) {
            tagToProductsMap[tagName] = [];
          }
          tagToProductsMap[tagName].push(product.id);
        }
      });

      productsUpdated++;
      console.log(`✓ Assigned ${tagIds.length} tags to: ${productName}`);

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error updating product ${productName}:`, error);
      productsFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Product tag assignment completed!");
  console.log(`✓ Updated: ${productsUpdated}`);
  console.log(`⏭️  Skipped: ${productsSkipped}`);
  console.log(`❌ Failed: ${productsFailed}`);
  console.log("=".repeat(50));

  // Step 3: Update tags with their associated products
  console.log("\nUpdating tags with product relationships...");
  let tagsUpdated = 0;
  let tagsUpdateFailed = 0;

  for (const [tagName, productIds] of Object.entries(tagToProductsMap)) {
    try {
      const tagId = tagMap[tagName];
      if (!tagId) continue;

      const existingTag = await payload.findByID({
        collection: "tags",
        id: tagId,
      });

      const existingProductIds = existingTag.products
        ? Array.isArray(existingTag.products)
          ? existingTag.products.map((p: any) => (typeof p === "string" ? p : p.id))
          : []
        : [];

      const allProductIds = Array.from(new Set([...existingProductIds, ...productIds]));

      await payload.update({
        collection: "tags",
        id: tagId,
        data: {
          products: allProductIds,
        },
      });

      tagsUpdated++;
      console.log(`✓ Updated tag "${tagName}" with ${allProductIds.length} products`);

      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`❌ Error updating tag ${tagName}:`, error);
      tagsUpdateFailed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Tag product relationship update completed!");
  console.log(`✓ Updated: ${tagsUpdated}`);
  console.log(`❌ Failed: ${tagsUpdateFailed}`);
  console.log("=".repeat(50));
};

// ==================== MAIN SEED FUNCTION ====================
const seed = async () => {
  const payload = await getPayload({ config });

  console.log("=".repeat(50));
  console.log("Starting database seeding...");
  console.log("=".repeat(50));

  // Seed in order: Admin User -> Categories -> Products -> Tags
  await seedAdminUser(payload);
  await seedCategories(payload);
  await seedProducts(payload);
  await seedTags(payload);

  console.log("\n" + "=".repeat(50));
  console.log("✅ All seeding completed successfully!");
  console.log("=".repeat(50));
};

try {
  await seed();
  process.exit(0);
} catch (error) {
  console.error("❌ Error during seeding:", error);
  process.exit(1);
}
