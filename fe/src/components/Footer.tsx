"use client";
import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
    const links = [
        { label: 'About', href: '/home/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Terms of Use', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
    ];

    const categories = [
        { label: 'Career Stories', href: '/category/career-stories' },
        { label: 'Guides', href: '/category/guides' },
        { label: 'Job Listings', href: '/category/job-listings' },
        { label: 'Planning', href: '/category/planning' },
        { label: 'Remote Work', href: '/category/remote-work' },
    ];

    return (
        <Box
            component="footer"
            id="footer"
            sx={{
                bgcolor: '#cfbae2', 
                color: 'white',
                pt: 2,
                pb: 1,
                mt: 'auto',
                fontFamily: '"Source Sans 3", sans-serif',
                fontSize: '18px'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={10}>
                    {/* Logo  */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Box className="footer-widget-area" id="footer-widget-1">
                            <Box sx={{ pt: 2 }}>
                                <Box sx={{ position: 'relative', width: 148, height: 148 }}>
                                    <Image
                                        src="https://roamroles.com/wp-content/uploads/sites/220/2025/08/Logo-Roam-Roler.png"
                                        alt="Roam Roles Logo"
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Links */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography 
                            component="h4"
                            sx={{ 
                                fontSize: '1.125rem',
                                fontWeight: 500,
                                mb: 2,
                                mt: 0,
                                pb: 0.5,
                                borderBottom: '2px solid rgba(255,255,255,0.6)',
                                display: 'inline-block',
                                textTransform: 'uppercase',
                                fontFamily: '"Source Sans 3", sans-serif'
                            }}
                        >
                            Links
                        </Typography>
                        <Box 
                            component="ul" 
                            className="footer-links"
                            id="menu-legal"
                            sx={{ 
                                listStyle: 'disc',
                                pl: 2.5,
                                m: 0,
                                mt: 0,
                                color: 'white',
                                '& li::marker': {
                                    fontSize: '0.8rem'
                                }
                            }}
                        >
                            {links.map((link) => (
                                <Box component="li" key={link.href} sx={{ mb: 1 }}>
                                    <MuiLink
                                        component={Link}
                                        href={link.href}
                                        sx={{
                                            color: 'white',
                                            textDecoration: 'none',
                                            fontSize: '0.875rem',
                                            fontFamily: '"Source Sans 3", sans-serif',
                                            '&:hover': { 
                                                textDecoration: 'underline',
                                                color: 'white'
                                            },
                                        }}
                                    >
                                        {link.label}
                                    </MuiLink>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Categories */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography 
                            component="h4"
                            sx={{ 
                                fontSize: '1.125rem',
                                fontWeight: 500,
                                mb: 2,
                                mt: 0,
                                pb: 0.5,
                                borderBottom: '2px solid rgba(255,255,255,0.6)',
                                display: 'inline-block',
                                textTransform: 'uppercase',
                                fontFamily: '"Source Sans 3", sans-serif'
                            }}
                        >
                            Categories
                        </Typography>
                        <Box 
                            component="ul" 
                            sx={{ 
                                listStyle: 'disc',
                                pl: 2.5,
                                m: 0,
                                mt: 0,
                                color: 'white',
                                '& li::marker': {
                                    fontSize: '0.8rem'
                                }
                            }}
                        >
                            {categories.map((category) => (
                                <Box component="li" key={category.href} sx={{ mb: 1 }} className="cat-item">
                                    <MuiLink
                                        component={Link}
                                        href={category.href}
                                        sx={{
                                            color: 'white',
                                            textDecoration: 'none',
                                            fontSize: '0.875rem',
                                            fontFamily: '"Source Sans 3", sans-serif',
                                            '&:hover': { 
                                                textDecoration: 'underline',
                                                color: 'white'
                                            },
                                        }}
                                    >
                                        {category.label}
                                    </MuiLink>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Empty column */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Box className="social-icons">
                            {/* Empty space for social icons if needed later */}
                        </Box>
                    </Grid>
                </Grid>

                {/* Copyright row */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography component="p" sx={{ color: 'white', fontSize: '0.875rem', m: 0, fontFamily: '"Source Sans 3", sans-serif' }}>
                        © 2026 Roam Roles - All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;