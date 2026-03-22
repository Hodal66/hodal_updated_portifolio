// Portfolio Configuration - Muheto Hodal
// Using Iconify icons instead of emojis

export const config = {
  name: 'Muheto Hodal',
  title: 'Full-Stack Developer & UI/UX Engineer',
  tagline: 'Crafting Digital Experiences That Matter',
  email: 'mhthodol@gmail.com',
  location: 'Kigali, Rwanda',
  website: 'hodaltech.space',
  github: 'github.com/Hodal66',
  linkedin: 'linkedin.com/in/muheto-hodal-23311a211',
  phone: '+250 782 439 775',
  yearsExp: '3+',
  projectsCompleted: '15+',
  technologies: '20+',
  clients: '10+',
  domain: 'Software Engineering'
};

export const techStack = ['React', 'TypeScript', 'Node.js', 'Spring Boot', 'PostgreSQL', 'MongoDB'];

export const stats = [
  { value: config.yearsExp, label: 'Years Experience' },
  { value: config.projectsCompleted, label: 'Projects Completed' },
  { value: config.technologies, label: 'Technologies' },
  { value: config.clients, label: 'Happy Clients' }
];

export const skills = {
  'Frontend Development': {
    icon: 'fluent:design-ideas-24-filled',
    gradient: 'from-violet-500 to-purple-600',
    items: [
      { name: 'React.js', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Next.js', level: 85 },
      { name: 'Tailwind CSS', level: 92 },
      { name: 'Redux', level: 88 }
    ]
  },
  'Backend Development': {
    icon: 'fluent:server-24-filled',
    gradient: 'from-emerald-500 to-teal-600',
    items: [
      { name: 'Node.js', level: 90 },
      { name: 'Spring Boot', level: 85 },
      { name: 'Express.js', level: 88 },
      { name: 'GraphQL', level: 82 },
      { name: 'REST APIs', level: 95 }
    ]
  },
  'Database & Cloud': {
    icon: 'fluent:database-24-filled',
    gradient: 'from-blue-500 to-cyan-600',
    items: [
      { name: 'PostgreSQL', level: 88 },
      { name: 'MongoDB', level: 90 },
      { name: 'MySQL', level: 85 },
      { name: 'Firebase', level: 80 },
      { name: 'AWS', level: 75 }
    ]
  },
  'DevOps & Tools': {
    icon: 'fluent:wrench-24-filled',
    gradient: 'from-orange-500 to-red-600',
    items: [
      { name: 'Git & GitHub', level: 95 },
      { name: 'Docker', level: 78 },
      { name: 'Linux', level: 85 },
      { name: 'CI/CD', level: 80 },
      { name: 'Nginx', level: 82 }
    ]
  }
};

export const projects = [
  {
    id: 1,
    slug: 'ihuze-mentorship-platform',
    title: 'IHUZE Mentorship Platform',
    subtitle: 'Enterprise-Grade Mentorship Ecosystem',
    category: 'Full-Stack Application',
    year: '2024-2025',
    duration: '8 months',
    status: 'Production',
    role: 'Lead Full-Stack Developer',
    team: '3 developers',
    description: 'A comprehensive professional mentorship platform connecting university students with industry mentors across Rwanda. Features role-based access control, real-time messaging, session scheduling, and progress tracking.',
    overview: `IHUZE represents a significant leap in connecting emerging talent with experienced professionals. The platform facilitates meaningful mentorship relationships through intelligent matching algorithms, integrated communication tools, and comprehensive progress tracking.

This project was born from identifying a gap in Rwanda's professional development ecosystem. University students often struggle to find experienced mentors who can guide them through their career journey. IHUZE bridges this gap by providing a structured, technology-driven approach to mentorship.`,
    challenge: `The main challenges included building a scalable matching algorithm that considers multiple factors (industry, skills, availability, location), implementing real-time communication without compromising performance, and integrating Rwanda's complete administrative hierarchy (Provinces → Districts → Sectors → Cells → Villages) for location-based matching.`,
    solution: `I architected a microservices-ready backend with Spring Boot, implementing JWT-based authentication with refresh token rotation for security. The frontend uses React with Redux for state management, connected via WebSocket for real-time features. The matching algorithm uses a weighted scoring system considering 12 different compatibility factors.`,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    gradient: 'from-indigo-600 to-violet-700',
    tech: ['Spring Boot', 'React', 'PostgreSQL', 'JWT Auth', 'WebSocket', 'Tailwind CSS', 'Redis', 'Docker'],
    architecture: [
      { layer: 'Frontend', tech: 'React 18 + TypeScript + Redux Toolkit + Tailwind CSS' },
      { layer: 'API Gateway', tech: 'Spring Cloud Gateway + Rate Limiting' },
      { layer: 'Backend', tech: 'Spring Boot 3.x + Spring Security + WebSocket' },
      { layer: 'Database', tech: 'PostgreSQL 15 + Redis Cache' },
      { layer: 'Infrastructure', tech: 'Docker + Nginx + Let\'s Encrypt SSL' }
    ],
    features: [
      { title: 'Smart Matching Algorithm', description: 'AI-powered mentor-mentee matching based on 12 compatibility factors including skills, industry, goals, and availability' },
      { title: 'Real-Time Messaging', description: 'WebSocket-based chat with typing indicators, read receipts, file sharing, and message threading' },
      { title: 'Session Management', description: 'Integrated scheduling with calendar sync, video call links, session notes, and automated reminders' },
      { title: 'Progress Tracking', description: 'Goal setting, milestone tracking, skill assessments, and comprehensive progress reports' },
      { title: 'Rwanda Hierarchy', description: 'Complete integration of Rwanda\'s 5-level administrative structure for precise location matching' },
      { title: 'Role-Based Access', description: 'Granular permissions for Admins, Mentors, Mentees with customizable dashboard views' }
    ],
    metrics: {
      users: { value: '500+', label: 'Active Users' },
      sessions: { value: '1,200+', label: 'Sessions Completed' },
      satisfaction: { value: '94%', label: 'Satisfaction Rate' },
      matches: { value: '350+', label: 'Successful Matches' }
    },
    lessons: [
      'Importance of user research before building complex matching systems',
      'WebSocket connection management at scale requires careful architecture',
      'Rwanda\'s administrative hierarchy integration taught valuable lessons about localization',
      'Building for mobile-first significantly improved overall user engagement'
    ],
    links: {
      github: 'https://github.com/Hodal66/ihuze-platform',
      live: 'https://ihuze.rw'
    }
  },
  {
    id: 2,
    slug: 'enterprise-admin-dashboard',
    title: 'Enterprise Admin Dashboard',
    subtitle: 'Real-Time Analytics & Management System',
    category: 'Dashboard Application',
    year: '2024',
    duration: '4 months',
    status: 'Production',
    role: 'Frontend Lead',
    team: '2 developers',
    description: 'A sophisticated admin dashboard featuring real-time data visualization, user management, and comprehensive analytics. Built with React and modern state management patterns.',
    overview: `This enterprise-grade dashboard provides organizations with powerful tools to monitor, analyze, and manage their operations in real-time. The modular architecture allows for easy customization and extension to meet specific business requirements.

The project started as a need for a unified interface to manage multiple business operations. Instead of switching between different tools, this dashboard consolidates all essential functions into a single, intuitive interface.`,
    challenge: `The primary challenges were handling real-time data updates without overwhelming the UI, implementing complex data visualizations that remain performant with large datasets, and building a flexible theming system that could adapt to different brand requirements.`,
    solution: `I implemented a virtual scrolling system for large data tables, used React.memo and useMemo strategically to prevent unnecessary re-renders, and built a custom charting wrapper around Recharts with automatic data aggregation for performance. The theming system uses CSS custom properties with a context-based provider.`,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    gradient: 'from-cyan-600 to-blue-700',
    tech: ['React', 'TypeScript', 'Redux Toolkit', 'Recharts', 'Material UI', 'REST API', 'Socket.io', 'Jest'],
    architecture: [
      { layer: 'UI Layer', tech: 'React 18 + Material UI + Custom Components' },
      { layer: 'State Management', tech: 'Redux Toolkit + RTK Query' },
      { layer: 'Data Visualization', tech: 'Recharts + D3.js for custom charts' },
      { layer: 'Real-Time', tech: 'Socket.io + Event Emitter pattern' },
      { layer: 'Testing', tech: 'Jest + React Testing Library + Cypress' }
    ],
    features: [
      { title: 'Real-Time Visualization', description: '15+ chart types with live data updates, zoom, pan, and drill-down capabilities' },
      { title: 'Advanced Filtering', description: 'Complex query builder with saved filters, date ranges, and full-text search' },
      { title: 'User Management', description: 'Complete RBAC with role hierarchy, permission templates, and audit logging' },
      { title: 'Export Engine', description: 'Multi-format export (PDF, Excel, CSV) with custom templates and scheduling' },
      { title: 'Theme System', description: 'Dynamic dark/light themes with system preference detection and custom brand colors' },
      { title: 'Responsive Design', description: 'Fully adaptive layout with mobile-optimized views and touch interactions' }
    ],
    metrics: {
      performance: { value: '98/100', label: 'Lighthouse Score' },
      loadTime: { value: '< 2s', label: 'Initial Load' },
      uptime: { value: '99.9%', label: 'Uptime' },
      coverage: { value: '87%', label: 'Test Coverage' }
    },
    lessons: [
      'Performance optimization is crucial for data-heavy dashboards',
      'RTK Query significantly simplifies API state management',
      'Investing in a robust component library pays dividends',
      'User feedback loops are essential for dashboard design'
    ],
    links: {
      github: 'https://github.com/Hodal66/admin____dashboard__react',
      demo: 'https://dashboard-demo.hodaltech.space'
    }
  },
  {
    id: 3,
    slug: 'it-infrastructure-lab',
    title: 'IT Infrastructure Lab',
    subtitle: 'Enterprise Network Security Environment',
    category: 'Network & Security',
    year: '2025',
    duration: '3 months',
    status: 'Academic Project',
    role: 'Infrastructure Engineer',
    team: 'Individual Project',
    description: 'A complete enterprise network environment featuring pfSense firewall, Active Directory, Wazuh SIEM, and comprehensive security monitoring. Demonstrates real-world IT infrastructure skills.',
    overview: `This project simulates a production enterprise environment with multiple network segments, centralized authentication, and advanced security monitoring. It showcases expertise in network administration, security operations, and system integration.

The environment was designed to mirror real-world corporate infrastructure, providing hands-on experience with enterprise-grade tools and security practices used by organizations worldwide.`,
    challenge: `Building a realistic enterprise environment with limited hardware resources required careful VM optimization. Integrating multiple security tools (pfSense, Wazuh, Suricata) while maintaining performance was challenging. Additionally, creating meaningful security rules and monitoring dashboards that provide actionable insights required extensive research.`,
    solution: `I implemented a resource-efficient VM allocation strategy, using nested virtualization where appropriate. Created custom integration scripts to correlate events across security tools. Developed a comprehensive documentation system with automated topology generation.`,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=1200',
    gradient: 'from-emerald-600 to-teal-700',
    tech: ['pfSense', 'Windows Server 2022', 'Active Directory', 'Wazuh SIEM', 'Suricata IDS', 'OpenVPN', 'NTOPng', 'VMware'],
    architecture: [
      { layer: 'Perimeter', tech: 'pfSense Firewall + OpenVPN + Suricata IDS' },
      { layer: 'Identity', tech: 'Windows Server 2022 + Active Directory + GPO' },
      { layer: 'Monitoring', tech: 'Wazuh SIEM + NTOPng + Custom Dashboards' },
      { layer: 'Network', tech: 'VLANs + Inter-VLAN Routing + QoS' },
      { layer: 'Backup', tech: 'Automated Snapshots + Off-site Replication' }
    ],
    features: [
      { title: 'Network Segmentation', description: 'Multi-VLAN architecture with LAN1 (192.168.1.0/29) and LAN2 (192.168.2.0/29) segments' },
      { title: 'Active Directory', description: 'Centralized authentication with 50+ GPO settings, roaming profiles, and software deployment' },
      { title: 'SIEM Monitoring', description: 'Wazuh deployment with custom rules, file integrity monitoring, and compliance dashboards' },
      { title: 'Intrusion Detection', description: 'Suricata IDS with custom rulesets, threat intelligence feeds, and automated blocking' },
      { title: 'VPN Access', description: 'OpenVPN server with certificate-based authentication and split tunneling' },
      { title: 'Traffic Analysis', description: 'NTOPng for bandwidth monitoring, application identification, and anomaly detection' }
    ],
    metrics: {
      vms: { value: '9', label: 'Virtual Machines' },
      rules: { value: '50+', label: 'Firewall Rules' },
      gpos: { value: '50+', label: 'GPO Settings' },
      uptime: { value: '99.5%', label: 'Lab Uptime' }
    },
    lessons: [
      'Proper network segmentation is fundamental to security',
      'SIEM deployment requires careful tuning to reduce false positives',
      'Documentation is crucial for infrastructure projects',
      'Automation saves significant time in repetitive tasks'
    ],
    links: {
      docs: 'http://192.168.1.3'
    }
  },
  {
    id: 4,
    slug: 'google-sheets-api-integration',
    title: 'Google Sheets API Integration',
    subtitle: 'Automated Data Synchronization Service',
    category: 'Backend Service',
    year: '2024',
    duration: '2 months',
    status: 'Production',
    role: 'Backend Developer',
    team: 'Individual Project',
    description: 'A Node.js service for seamless Google Sheets integration, enabling automated data synchronization, real-time updates, and batch operations for business workflows.',
    overview: `This service bridges the gap between Google Sheets and custom applications, providing a robust API layer for data operations. Many businesses rely on Google Sheets for data management but need programmatic access for automation.

The service handles the complexity of Google's API, rate limits, and authentication, exposing a simple REST interface that any application can consume.`,
    challenge: `Google's API rate limits required implementing intelligent request queuing. Handling large spreadsheets (10,000+ rows) without timeouts needed streaming approaches. Maintaining data consistency during concurrent updates from multiple sources was complex.`,
    solution: `I implemented Bull Queue with Redis for request management, used streaming reads/writes for large datasets, and implemented optimistic locking with version tracking for concurrent updates. The service includes automatic retry with exponential backoff.`,
    image: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&q=80&w=1200',
    gradient: 'from-green-600 to-emerald-700',
    tech: ['Node.js', 'Express', 'Google APIs', 'OAuth 2.0', 'Redis', 'Bull Queue', 'Jest', 'Docker'],
    architecture: [
      { layer: 'API Layer', tech: 'Express.js + Validation + Rate Limiting' },
      { layer: 'Auth', tech: 'OAuth 2.0 + JWT + Refresh Token Rotation' },
      { layer: 'Queue', tech: 'Bull Queue + Redis + Priority Scheduling' },
      { layer: 'Integration', tech: 'Google Sheets API v4 + Batch Operations' },
      { layer: 'Monitoring', tech: 'Winston Logger + Prometheus Metrics' }
    ],
    features: [
      { title: 'Bidirectional Sync', description: 'Real-time synchronization between applications and Google Sheets with conflict resolution' },
      { title: 'Batch Operations', description: 'Process thousands of rows efficiently with progress tracking and resumable operations' },
      { title: 'OAuth 2.0', description: 'Secure authentication flow with automatic token refresh and scope management' },
      { title: 'Rate Limiting', description: 'Intelligent request queuing to stay within Google\'s API limits' },
      { title: 'Webhooks', description: 'Push notifications for sheet changes with customizable triggers' },
      { title: 'Data Validation', description: 'Schema validation, type coercion, and transformation pipelines' }
    ],
    metrics: {
      requests: { value: '10K+', label: 'Daily Requests' },
      latency: { value: '< 100ms', label: 'Avg Response' },
      accuracy: { value: '100%', label: 'Data Accuracy' },
      uptime: { value: '99.9%', label: 'Service Uptime' }
    },
    lessons: [
      'Queue-based architecture is essential for third-party API integration',
      'Comprehensive error handling and retry logic prevents data loss',
      'API documentation should be a first-class concern',
      'Monitoring and alerting catch issues before users do'
    ],
    links: {
      github: 'https://github.com/Hodal66/google-sheet-width-nodejs-api'
    }
  },
  {
    id: 5,
    slug: 'travel-services-platform',
    title: 'Travel Services Platform',
    subtitle: 'Complete Travel Booking Ecosystem',
    category: 'Full-Stack Application',
    year: '2024',
    duration: '5 months',
    status: 'Development',
    role: 'Full-Stack Developer',
    team: '2 developers',
    description: 'A comprehensive travel booking platform with flight search, hotel reservations, and package deals. Features modern UI/UX and secure payment processing.',
    overview: `This platform revolutionizes travel booking by providing a seamless, unified experience for flights, hotels, and vacation packages. The system integrates with multiple travel APIs to provide comprehensive search results and competitive pricing.

Built with performance and user experience in mind, the application uses server-side rendering for SEO optimization and implements lazy loading for optimal user experience.`,
    challenge: `Aggregating results from multiple travel APIs with different response formats and latencies required careful architecture. Implementing real-time pricing that remains consistent through the booking flow was complex. Building a search experience that feels instant despite API delays needed creative solutions.`,
    solution: `I implemented a unified adapter pattern for different travel APIs, used Redis for price caching with TTL-based invalidation, and built a progressive search UI that shows results as they arrive. Payment flow uses idempotency keys to prevent double bookings.`,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200',
    gradient: 'from-sky-600 to-blue-700',
    tech: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Stripe', 'Amadeus API', 'Redux', 'Redis'],
    architecture: [
      { layer: 'Frontend', tech: 'Next.js 14 + React + Tailwind CSS' },
      { layer: 'API', tech: 'Node.js + Express + API Aggregation Layer' },
      { layer: 'Database', tech: 'MongoDB Atlas + Redis Cache' },
      { layer: 'Payments', tech: 'Stripe + Webhook Handlers' },
      { layer: 'External APIs', tech: 'Amadeus + Booking.com + Skyscanner' }
    ],
    features: [
      { title: 'Flight Search', description: 'Multi-provider search with filters for stops, airlines, times, and price ranges' },
      { title: 'Hotel Booking', description: 'Dynamic availability with room types, amenities filtering, and map view' },
      { title: 'Secure Payments', description: 'PCI-compliant Stripe integration with support for multiple currencies' },
      { title: 'User Reviews', description: 'Verified booking reviews with photos and detailed ratings' },
      { title: 'Booking Management', description: 'Self-service portal for modifications, cancellations, and rebooking' },
      { title: 'Notifications', description: 'Email and SMS notifications for confirmations, reminders, and updates' }
    ],
    metrics: {
      searches: { value: '5K+', label: 'Daily Searches' },
      bookings: { value: '200+', label: 'Bookings' },
      partners: { value: '15+', label: 'API Partners' },
      conversion: { value: '4.2%', label: 'Conversion Rate' }
    },
    lessons: [
      'API aggregation requires robust error handling and fallbacks',
      'Caching strategy is critical for travel pricing',
      'Progressive enhancement improves perceived performance',
      'Payment integration requires extensive testing'
    ],
    links: {
      demo: 'https://travel.hodaltech.space'
    }
  },
  {
    id: 6,
    slug: 'timtom-aviation-training-portal',
    title: 'Timtom Aviation Training Portal',
    subtitle: 'Educational Platform for IT Skills',
    category: 'Educational Platform',
    year: '2022-2023',
    duration: '10 months',
    status: 'Completed',
    role: 'Lead Developer & Technical Trainer',
    team: 'Individual Project',
    description: 'An educational platform developed for Timtom Aviation Ltd to provide computer science training and internship management system.',
    overview: `As Technical Trainer at Timtom Aviation Ltd, I developed and maintained this training portal that served as the primary resource for interns and trainees learning computer science fundamentals, UI/UX design, and web development.

The platform includes interactive tutorials, progress tracking, and a project submission system for practical assessments. It was designed to provide a structured learning path from basics to job-ready skills.`,
    challenge: `Creating engaging learning content that caters to students with varying technical backgrounds was challenging. Building an assessment system that accurately evaluates practical skills (not just theory) required innovative approaches. Managing the platform while also teaching required efficient time management.`,
    solution: `I implemented adaptive learning paths that adjust based on assessment results, created practical project-based assessments with automated testing where possible, and built reusable content templates that reduced content creation time by 60%.`,
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=1200',
    gradient: 'from-amber-600 to-orange-700',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'MySQL', 'Bootstrap', 'jQuery', 'AJAX'],
    architecture: [
      { layer: 'Frontend', tech: 'HTML5 + CSS3 + Bootstrap 5 + jQuery' },
      { layer: 'Backend', tech: 'PHP 8.x + MVC Pattern' },
      { layer: 'Database', tech: 'MySQL 8.0 + PDO' },
      { layer: 'Content', tech: 'Markdown + Video Hosting Integration' },
      { layer: 'Assessment', tech: 'Custom Quiz Engine + Code Evaluation' }
    ],
    features: [
      { title: 'Learning Modules', description: 'Structured courses with video lessons, reading materials, and interactive exercises' },
      { title: 'Progress Tracking', description: 'Visual progress indicators, completion certificates, and skill badges' },
      { title: 'Project System', description: 'Assignment submission with peer review and instructor feedback' },
      { title: 'Certificates', description: 'Automated certificate generation upon course completion' },
      { title: 'Resource Library', description: 'Downloadable materials, code samples, and reference documentation' },
      { title: 'Communication', description: 'Discussion forums, direct messaging, and announcement system' }
    ],
    metrics: {
      students: { value: '100+', label: 'Trainees' },
      courses: { value: '12', label: 'Courses Created' },
      completion: { value: '85%', label: 'Completion Rate' },
      employment: { value: '72%', label: 'Employment Rate' }
    },
    lessons: [
      'Engagement requires varied content formats',
      'Practical assessments are more valuable than theoretical tests',
      'Regular feedback loops improve learning outcomes',
      'Building for education taught me patience and empathy'
    ],
    links: {
      company: 'https://timtomaviation.com'
    }
  }
];

export const experience = [
  {
    role: 'Full-Stack Developer & UI/UX Designer',
    company: 'Freelance / HodalTech',
    period: '2023 - Present',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    description: 'Leading development of enterprise applications, mentorship platforms, and custom business solutions. Specializing in React, Spring Boot, and cloud-native architectures.',
    achievements: [
      'Delivered 10+ production applications',
      'Achieved 95% client satisfaction rate',
      'Reduced development time by 40% through reusable component libraries',
      'Mentored 5 junior developers'
    ]
  },
  {
    role: 'Technical Trainer & Web Developer',
    company: 'Timtom Aviation Ltd',
    period: 'Aug 2022 - Jun 2023',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    description: 'Managed IT infrastructure, taught UI/UX design and web development, and supervised computer science internships.',
    achievements: [
      'Trained 100+ trainees in web development',
      'Developed comprehensive training curriculum',
      'Established internship program framework',
      'Improved IT infrastructure efficiency by 60%'
    ]
  },
  {
    role: 'Junior Software Engineer',
    company: 'Andela',
    period: '2021 - 2022',
    location: 'Remote',
    type: 'Fellowship',
    description: 'Participated in intensive software development program focusing on JavaScript, React, and collaborative development practices.',
    achievements: [
      'Completed advanced React certification',
      'Contributed to 3 team projects',
      'Achieved top 10% performance ranking',
      'Built production-ready applications'
    ]
  }
];

export const education = [
  {
    degree: 'Bachelor of Science in Information Technology',
    institution: 'Adventist University of Central Africa (AUCA)',
    period: '2022 - 2026',
    status: 'In Progress',
    focus: 'Software Engineering & Network Administration'
  },
  {
    degree: 'Advanced Diploma in Software Development',
    institution: 'IPRC Kigali',
    period: '2019 - 2022',
    status: 'Completed',
    focus: 'Full-Stack Web Development'
  }
];

export const certifications = [
  { name: 'Andela Technical Leadership Program', issuer: 'Andela', year: '2022', icon: 'simple-icons:andela' },
  { name: 'React Professional Developer', issuer: 'Meta', year: '2023', icon: 'simple-icons:meta' },
  { name: 'UI/UX Design Fundamentals', issuer: 'Google', year: '2022', icon: 'simple-icons:google' },
  { name: 'MongoDB Developer', issuer: 'MongoDB University', year: '2023', icon: 'simple-icons:mongodb' }
];

export const sections = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];

export const contactItems = [
  { icon: 'fluent:mail-24-filled', label: 'Email', value: config.email, link: `mailto:${config.email}` },
  { icon: 'fluent:globe-24-filled', label: 'Website', value: config.website, link: `https://${config.website}` },
  { icon: 'simple-icons:linkedin', label: 'LinkedIn', value: 'Connect with me', link: `https://${config.linkedin}` },
  { icon: 'simple-icons:github', label: 'GitHub', value: 'View my code', link: `https://${config.github}` }
];
