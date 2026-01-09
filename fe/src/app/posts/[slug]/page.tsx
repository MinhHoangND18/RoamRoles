"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    CardContent,
    CircularProgress,
    Alert
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Image from 'next/image';
import Link from 'next/link';
import { getJobPostBySlug, jobPosts } from '@/src/app/data/mockPosts';
import { fetchPostBySlug } from '@/src/lib/posts-api';
import { JobPost } from '@/src/types/jobPost';

export default function JobDetail() {
    const params = useParams();
    const slug = params?.slug as string;
    
    // State for API data
    const [jobData, setJobData] = useState<JobPost | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from API
    useEffect(() => {
        const loadPost = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const apiData = await fetchPostBySlug(slug);
                
                if (apiData) {
                    setJobData(apiData);
                } else {
                    const mockData = getJobPostBySlug(slug);
                    setJobData(mockData || null);
                }
            } catch (err: any) {
                console.error('Error loading post:', err);
            
                const mockData = getJobPostBySlug(slug);
                if (mockData) {
                    setJobData(mockData);
                    setError('Không thể tải từ API, đang sử dụng dữ liệu mẫu.');
                } else {
                    setError(err.message || 'Không thể tải bài viết.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadPost();
        }
    }, [slug]);

    // Show loading state
    if (loading) {
        return (
            <Box component="main" sx={{ bgcolor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                        Đang tải dữ liệu...
                    </Typography>
                </Container>
            </Box>
        );
    }

    // Show error state (but still show fallback data if available)
    if (!jobData && error) {
        return (
            <Box component="main" sx={{ bgcolor: '#fff' }}>
                <Container maxWidth="md" sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                    <Box sx={{ borderTop: '1px solid #e5e7eb', pt: 3 }}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                            📋 Danh sách Job Posts có sẵn:
                        </Typography>
                        <Grid container spacing={2}>
                            {jobPosts.map((post) => (
                                <Grid size={{xs:12}} key={post.slug}>
                                    <Card sx={{ border: '1px solid #e5e7eb', '&:hover': { borderColor: '#15803d' } }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                                                {post.hero.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                                                {post.hero.eyebrow}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                <Typography variant="body2" sx={{ color: '#9ca3af', fontFamily: 'monospace' }}>
                                                    Slug: <strong>{post.slug}</strong>
                                                </Typography>
                                                <Link href={`/posts/${post.slug}`} style={{ textDecoration: 'none' }}>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#15803d',
                                                            '&:hover': { bgcolor: '#166534' }
                                                        }}
                                                    >
                                                        Xem chi tiết
                                                    </Button>
                                                </Link>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        {jobPosts.length === 0 && (
                            <Typography variant="body1" sx={{ textAlign: 'center', color: '#9ca3af', py: 4 }}>
                                Chưa có job post nào trong hệ thống.
                            </Typography>
                        )}
                    </Box>
                </Container>
            </Box>
        );
    }

    // If no data at all
    if (!jobData) {
        return (
            <Box component="main" sx={{ bgcolor: '#fff' }}>
                <Container maxWidth="md" sx={{ py: 4 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Box sx={{ borderTop: '1px solid #e5e7eb', pt: 3 }}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                            📋 Danh sách Job Posts có sẵn:
                        </Typography>
                        <Grid container spacing={2}>
                            {jobPosts.map((post) => (
                                <Grid size={{xs:12}} key={post.slug}>
                                    <Card sx={{ border: '1px solid #e5e7eb', '&:hover': { borderColor: '#15803d' } }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                                                {post.hero.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                                                {post.hero.eyebrow}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                <Typography variant="body2" sx={{ color: '#9ca3af', fontFamily: 'monospace' }}>
                                                    Slug: <strong>{post.slug}</strong>
                                                </Typography>
                                                <Link href={`/posts/${post.slug}`} style={{ textDecoration: 'none' }}>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#15803d',
                                                            '&:hover': { bgcolor: '#166534' }
                                                        }}
                                                    >
                                                        Xem chi tiết
                                                    </Button>
                                                </Link>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        {jobPosts.length === 0 && (
                            <Typography variant="body1" sx={{ textAlign: 'center', color: '#9ca3af', py: 4 }}>
                                Chưa có job post nào trong hệ thống.
                            </Typography>
                        )}
                    </Box>
                </Container>
            </Box>
        );
    }
    // Show success message if fallback was used
    const showSuccessMessage = error && jobData;

    return (
        <Box component="main" sx={{ bgcolor: '#fff' }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                {showSuccessMessage && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                {/* Hero Section */}
                <Box id="heading" sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 400,
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            mb: 2
                        }}
                    >
                        {jobData.hero.eyebrow}
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 500,
                            color: '#111827',
                            fontSize: { xs: '1.5rem', md: '2rem' }
                        }}
                    >
                        {jobData.hero.title}
                    </Typography>
                </Box>

                {/* Primary Card with Image */}
                <Box
                    sx={{
                        borderTop: '1px solid #ccc',
                        borderBottom: '1px solid #ccc',
                        py: 3,
                        mb: 4
                    }}
                >
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid size={{xs:12, md:5 }} > 
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 190,
                                    bgcolor: '#e5e7eb',
                                    borderRadius: 1,
                                    border: '1px solid #d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography color="text.secondary">Image Placeholder</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{xs:12, md:7}} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.6, mb: 2 }}>
                                {jobData.primary_card.description}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#15803d',
                                        color: 'white',
                                        textTransform: 'none',
                                        fontSize: '1.125rem',
                                        py: 1,
                                        px: 4,
                                        width: '100%',
                                        '&:hover': { bgcolor: '#166534' }
                                    }}
                                >
                                    {jobData.primary_card.button.text}
                                </Button>
                                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 1, textAlign: 'center' }}>
                                    {jobData.primary_card.button.note}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Secondary Card - Highlights */}
                    <Box sx={{ mt: 4 }}>
                        <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.6, mb: 3, textAlign: 'center' }}>
                            {jobData.secondary_card.description}
                        </Typography>
                        <Grid container spacing={2}>
                            {jobData.secondary_card.highlights.map((item, index) => (
                                <Grid size={{xs:12, md:6}} key={index}>
                                    <Box
                                        sx={{
                                            bgcolor: '#f3f4f6',
                                            borderRadius: 1,
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '100%'
                                        }}
                                    >
                                        <CheckCircleOutlineIcon sx={{ color: '#16a34a', fontSize: '1.5rem', mr: 2, flexShrink: 0 }} />
                                        <Typography sx={{ fontWeight: 500 }}>
                                            {item.icon} {item.text}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: '#15803d',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontSize: '1.125rem',
                                    py: 1,
                                    px: 4,
                                    width: { xs: '100%', md: 'auto' },
                                    '&:hover': { bgcolor: '#166534' }
                                }}
                            >
                                {jobData.primary_card.button.text}
                            </Button>
                            <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 1 }}>
                                {jobData.primary_card.button.note}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Main Content Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>
                        {jobData.sections[0].heading}
                    </Typography>
                    <Box sx={{ mb: 3, bgcolor: '#f3f4f6', p: 1, borderRadius: 1 }}>
                        <Box
                            sx={{
                                width: '100%',
                                height: 300,
                                bgcolor: '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1
                            }}
                        >
                            <Typography color="text.secondary">Image Placeholder</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.875rem', fontStyle: 'italic', color: '#6b7280', mt: 1, textAlign: 'center' }}>
                            {jobData.sections[0].image.caption} – Source: {jobData.sections[0].image.source}
                        </Typography>
                    </Box>
                    {jobData.sections[0].paragraphs.map((para, index) => (
                        <Typography key={index} sx={{ mb: 2, lineHeight: 1.7, textAlign: 'justify' }}>
                            {para}
                        </Typography>
                    ))}
                </Box>

                {/* Story Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>
                        {jobData.story.title}
                    </Typography>
                    {jobData.story.paragraphs.map((para, index) => (
                        <Typography key={index} sx={{ mb: 2, lineHeight: 1.7, textAlign: 'justify' }}>
                            {para}
                        </Typography>
                    ))}
                </Box>

                {/* FAQ Section */}
                <Box sx={{ mb: 4 }}>
                    {jobData.faq.map((item, index) => (
                        <Accordion key={index} sx={{ mb: 1, '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 500 }}>{item.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{item.answer}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                {/* Open Roles Card */}
                <Box
                    sx={{
                        borderTop: '1px solid #ccc',
                        borderBottom: '1px solid #ccc',
                        py: 3,
                        mb: 4
                    }}
                >
                    <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 500, mb: 3 }}>
                        Open Roles
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{xs:12, md:5}}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 190,
                                    bgcolor: '#e5e7eb',
                                    borderRadius: 1,
                                    border: '1px solid #d1d5db'
                                }}
                            />
                        </Grid>
                        <Grid size={{xs:12, md:7}} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                                    {jobData.open_roles.company}
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        component="span"
                                        sx={{
                                            bgcolor: '#dcfce7',
                                            color: '#15803d',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 1,
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        APPLY ONLINE
                                    </Typography>
                                </Box>
                                <Typography sx={{ textAlign: 'justify', mb: 2 }}>
                                    {jobData.open_roles.description}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#15803d',
                                        color: 'white',
                                        textTransform: 'none',
                                        fontSize: '1.125rem',
                                        py: 1,
                                        px: 4,
                                        width: '100%',
                                        '&:hover': { bgcolor: '#166534' }
                                    }}
                                >
                                    View Careers
                                </Button>
                                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 1, textAlign: 'center' }}>
                                    You`ll be redirected to an external site
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Recommended Content */}
                <Box
                    sx={{
                        borderTop: '1px solid #ccc',
                        borderBottom: '1px solid #ccc',
                        py: 3,
                        mb: 4
                    }}
                >
                    <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 500, mb: 3 }}>
                        Recommended Content
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{xs:12, md:5}}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 190,
                                    bgcolor: '#e5e7eb',
                                    borderRadius: 1,
                                    border: '1px solid #d1d5db'
                                }}
                            />
                        </Grid>
                        <Grid size={{xs:12, md:7}} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                                    {jobData.recommended.title}
                                </Typography>
                                <Typography sx={{ textAlign: 'justify', mb: 2 }}>
                                    {jobData.recommended.description}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#15803d',
                                        color: 'white',
                                        textTransform: 'none',
                                        fontSize: '1.125rem',
                                        py: 1,
                                        px: 4,
                                        width: '100%',
                                        '&:hover': { bgcolor: '#166534' }
                                    }}
                                >
                                    See more jobs
                                </Button>
                                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 1, textAlign: 'center' }}>
                                    You will remain in the same website
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Post Meta */}
                {jobData.meta && (
                    <Box sx={{ borderTop: '1px solid #e5e7eb', pt: 3, mb: 4 }}>
                        <Typography sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Published by <strong>{jobData.meta.author}</strong> on {jobData.meta.publishedAt}
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}