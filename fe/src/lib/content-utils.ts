export const transformContent = (content: string) => {
  if (!content) return "";
  let processed = content;

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
