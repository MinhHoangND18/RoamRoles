// constants/brands.ts
export const brands = {
  "jobzesty.com": {
    name: "Job Zesty",
    url: "https://jobzesty.com",
  },
  "jobsmatch4u.com": {
    name: "JobsMatch4U",
    url: "https://jobsmatch4u.com",
  },
  "default": {
    name: "Job Platform",
    url: "https://jobzesty.com", 
  }
};

export type Brand = typeof brands["default"];


export function getBrandData(host: string | null): Brand {
  if (!host) return brands.default;
  
  if (host.includes("jobsmatch4u.com")) {
    return brands["jobsmatch4u.com"];
  }
  
  if (host.includes("jobzesty.com")) {
    return brands["jobzesty.com"];
  }

  return brands.default;
}