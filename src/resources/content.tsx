import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Logo, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Bola",
  lastName: "Banjo",
  name: `Bola Banjo`,
  role: "Mechanical & Software Engineer",
  avatar: "/images/square.png",
  email: "omogbolahanng@gmail.com",
  location: "Africa/Lagos", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>My weekly newsletter about engineering and technology.</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/bolaabanjo",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/bolaabanjo/",
  },
  {
    name: "X (Formally Twitter)",
    icon: "twitter",
    link: "https://www.x.com/bolaabanjo",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}`,
  description: `Personal website showcasing my work as a ${person.role}`,
  headline: <>Welcome To My Personal Archive.</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Gitstack</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work/building-once-ui-a-customizable-design-system",
  },
  subline: (
    <>
      
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com/bolaabanjo/chat",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I’m an Engineer, Systems Designer, and a deep-tech fan driven by one mission: to build. 
        My work cuts across Artificial Intelligence, Software Engineering, Quantum Energy, Cybersecurity, Product Design, and Mechanical Engineering.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "IGA",
        timeframe: "2025 - Present",
        role: "Maritime Engineer",
        achievements: [
          <>
            Collaborating with engineers to improve and optimize
            the performance of a native ship before they sail.
          </>,
          <>
            Contibution to the ultrasonic testing of a ship to 
            repair damages made and get it up and running.
          </>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          {
            src: "/images/projects/project-01/ship.jpg",
            alt: "Bola Banjo on a ship deck",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        company: "The Fohn Creative",
        timeframe: "2024 - 2025",
        role: "Founder/ Design Engineer",
        achievements: [
          <>
            Overseeing high-profile design and security 
            architecture projects for enterprises and startups.
          </>,
          <>
            Building and designing functioning solution for SMEs and startups
            to enhance brand perception and positioning.
          </>,
        ],
        images: [],
      },
      {
        company: "FohnAI",
        timeframe: "2025 - Present",
        role: "Founder/ System Engineer",
        achievements: [
          <>
            Collaborating with engineers, designers, and researchers 
            to push the boundaries of AI security technology.
          </>,
          <>
            Continuously iterating on product features based 
            on data-driven insights and user feedback
          </>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          {
            src: "/images/projects/project-01/shot4.png",
            alt: "Once UI Project",
            width: 16,
            height: 9,
          },
          {
            src: "/images/projects/project-01/shot3.png",
            alt: "Once UI Project",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        company: "ExecuJet Aviation Group",
        timeframe: "2023 - 2024",
        role: "Aircraft Engineer",
        achievements: [
          <>
            Worked on private jet maintenance and system diagnostics, ensuring optimal 
            aircraft performance.
          </>,
          <>
            Gained hands-on experience with high-tech avionics, mechanical 
            systems, and safety protocols.
          </>,
        ],
        images: [
          {
            src: "/images/projects/project-01/work.png",
            alt: "Bola Banjo working on an Aircraft",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "Olabisi Onabanjo University",
        description: <>Studied Mechanical Engineering.</>,
      },
      {
        name: "MIT OCW",
        description: <>Studied Computer Science and Software Engineering.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Figma",
        description: (
          <>Designing concepts from scratch and prototyping.</>
        ),
        tags: [
          {
            name: "Figma",
            icon: "figma",
          },
        ],
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/shot1.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
          {
            src: "/images/projects/project-01/shot2.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        title: "Next.js",
        description: (
          <>Building exciting personal projects with Next.js.</>
        ),
        tags: [
          {
            name: "TypeScript",
            icon: "typescript",
          },
          {
            name: "Next.js",
            icon: "nextjs",
          },
          {
            name: "Supabase",
            icon: "supabase",
          },
        ],
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/stack.png",
            alt: "gitstack sign up page",
            width: 16,
            height: 9,
          },
        ],
      },  
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about Engineering, Design, AI, Business and Tech...",
  description: `Read what ${person.name} is thinking lately`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  // Images by https://lorant.one
  // These are placeholder images, replace with your own
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
