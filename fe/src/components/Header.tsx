"use client";
import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Button, IconButton,
    Drawer, List, ListItem, ListItemText, Box,
    Container, InputBase, Paper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import Image from 'next/image';

const navItems = [
    { title: 'Career Stories', href: '/category/career-stories/' },
    { title: 'Job Listings', href: '/category/job-listings/' },
    { title: 'Remote Work', href: '/category/remote-work/' },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    return (
        <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>

                    {/* Logo và Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {/* Logo */}
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'black' }}>
                            <Image
                                src="https://roamroles.com/wp-content/uploads/sites/220/2025/08/Design-sem-nome.png"
                                alt="Roam Roles"
                                width={45}
                                height={45}
                                unoptimized
                            />
                            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600, fontSize: '1.25rem' }}>
                                Roam Roles
                            </Typography>
                        </Link>

                        {/* MENU DESKTOP */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.title}
                                    component={Link}
                                    href={item.href}
                                    sx={{
                                        color: '#666',
                                        textTransform: 'none',
                                        fontSize: '0.95rem',
                                        fontWeight: 400,
                                        minWidth: 'auto',
                                        padding: 0,
                                        '&:hover': {
                                            color: '#a32df1',
                                            bgcolor: 'transparent'
                                        }
                                    }}
                                >
                                    {item.title}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    {/* Search Bar */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        <Paper
                            component="form"
                            action="/"
                            method="GET"
                            elevation={0}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: 280,
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}
                        >
                            <InputBase
                                sx={{ ml: 2, flex: 1, fontSize: '0.9rem' }}
                                placeholder="Search"
                                name="s"
                            />
                            <IconButton
                                type="submit"
                                sx={{
                                    p: '12px',
                                    bgcolor: '#a32df1',
                                    color: 'white',
                                    borderRadius: 0,
                                    '&:hover': { bgcolor: '#8e24d4' }
                                }}
                                aria-label="search"
                            >
                                <SearchIcon />
                            </IconButton>
                        </Paper>
                    </Box>

                    {/* MOBILE MENU ICON */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </Container>

            {/* MOBILE DRAWER */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                sx={{ '& .MuiDrawer-paper': { width: 250 } }}
            >
                <List>
                    {navItems.map((item) => (
                        <ListItem key={item.title} component={Link} href={item.href} onClick={handleDrawerToggle}>
                            <ListItemText primary={item.title} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </AppBar>
    );
}