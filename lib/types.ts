export interface NavbarScrollProps {
  toggleMenu: () => void;
  isScrolling?: boolean;
  packagesOpen: boolean;
  togglePackages: () => void;
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
  position : string,
  company: string,
  testimonial: string
}

export interface Quotes {
  quote : string;
  author?:string;
}

export type FaqType = {
  faqs: {
    question: string;
    answer: string;
  }[];
};

export interface PackageItemTypes {
  name:string;
  title:string;
  slug:string;
  coverImage:string;
  description:string;
  descpoints:string[];
  credibility: {
    title:string;
    value:string;
    desc:string;
  };
  highlights: {
    name:string;
    title:string;
    desc:string;
    coverImage:string;
  };
  stages: {
    stage:string;
    title:string;
    desc:string;
  }
}

export interface BlogTypes {
  name:string;
  title:string;
  slug:string;
  coverImage:string;
  time:string;
  caption:string;
  category:string;
  author?:string;
  designation?:string;
  company?:string;
  content?:string;
}

export interface CaseStudyTypes {
  slug:string;
  coverImage:string;
  projectName:string;
  industry:string;
  introduction:string;
  tags:string[];
  title:string;
  caption:string;
}