/**
 * Get display-friendly domain name from host
 * Examples: 
 *   "localhost:3000" -> "localhost"
 *   "jobzesty.com" -> "JobZesty"
 *   "example-site.com" -> "Example Site"
 */
export const getDomainDisplayName = (host: string | null): string => {
  if (!host) return "Our Site";

  // Remove port if present
  const domain = host.split(':')[0];

  // If localhost, return as-is or a friendly name
  if (domain === 'localhost' || domain === '127.0.0.1') {
    return "Our Site";
  }

  // Remove TLD (.com, .org, etc.) and www
  const cleanDomain = domain
    .replace(/^www\./, '')
    .replace(/\.(com|org|net|io|co|info|biz)$/i, '');

  // Convert to title case with spaces
  // "jobzesty" -> "Job Zesty", "my-site" -> "My Site"
  const words = cleanDomain.split(/[-_]/).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  // Handle brand names in single words (e.g., "jobzesty" -> "JobZesty")
  if (words.length === 1 && words[0].length > 4) {
    // Try to split camelCase-like patterns
    const splitWord = words[0].replace(/([a-z])([A-Z])/g, '$1 $2');
    if (splitWord !== words[0]) {
      return splitWord;
    }
    // Capitalize brand name components without adding spaces
    const brandName = words[0]
      .replace(/(job)(zesty)/gi, 'Job$2')
      .replace(/(job)(s?)(match)/gi, 'Job$2Match')
      .replace(/^(.)/, (match) => match.toUpperCase());

    // Apply title case to each recognized word component
    const capitalized = brandName
      .replace(/\b(zesty|match|work|hire|career)(\d*)/gi,
        (match, word, num) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + num);

    if (capitalized !== words[0]) {
      return capitalized;
    }
  }

  return words.join(' ');
};

export const transformContent = (content: string, host?: string | null) => {
  if (!content) return "";
  let processed = content;

  // Replace {{DOMAIN}} macro with actual domain name
  if (host) {
    const domainName = getDomainDisplayName(host);
    processed = processed.replace(/\{\{DOMAIN\}\}/g, domainName);
  }

  processed = processed.replace(
    /href="https:\/\/roamroles\.com\/([^"\/]+)\/?"/g,
    'href="/$1"'
  );

  processed = processed.replace(/href="https:\/\/roamroles\.com\/author\/[^"]*"[^>]*>.*?/g, '');

  const wpUploadsRegex =
    /https:\/\/roamroles\.com\/wp-content\/uploads\/(?:sites\/\d+\/)?\d{4}\/\d{2}\//g;

  processed = processed.replace(wpUploadsRegex, "/images/");

  return processed;
};