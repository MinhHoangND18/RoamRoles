import { posts } from "@/src/app/data/mockPosts";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import PostCard from "@/src/components/PostCard";

export default function HomePage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        📚 Bài viết mới
      </Typography>

      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid size={{xs:12, sm:6}}  key={post.id}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
