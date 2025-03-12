export interface NavbarScrollProps {
    toggleMenu: () => void;
    isScrolling?: boolean;
  }
  
export interface Packages {
  slug: string;
  coverImage: string;
  title: string;
  description: string;
}

export interface brandingWorking {
  title:string;
  desc: string;
}

export interface Testimonials {
  name:string,
  coverImage: string,
  position : string,
  stars: string,
  company: string,
  testimonial: string
}