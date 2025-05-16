import EntrepreneurshipNytSubmission from "./entrepreneurship-nyt-submission.md";

const posts = [EntrepreneurshipNytSubmission];

function parseBlogPostFile(file) {
  const lines = file.split("\n").filter(Boolean);
  let lastMetadataLine = 0;
  const metadata = {};

  if (lines[0] !== "---") return;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      lastMetadataLine = i;
      break;
    }
    const key = lines[i].split(":")[0].trim();
    const value = lines[i].split(":")[1].trim();
    metadata[key] = value;
  }

  metadata.content = lines.slice(lastMetadataLine + 1).join("\n");

  if (!Object.prototype.hasOwnProperty.call(metadata, "image")) {
    metadata.image = null;
  }

  return metadata;
}

export default posts.map((f) => parseBlogPostFile(f));
