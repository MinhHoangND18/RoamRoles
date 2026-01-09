"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Note() {
  return (
    <Box 
      sx={{ 
        width: '100%', 
        backgroundColor: '#ffffffff',
        display: 'flex',
        justifyContent: 'center',
        py: 4,
        mb: 3
      }}
    >
      <Box
        sx={{
          width: { xs: '90%', sm: '85%', md: '80%' },
          maxWidth: '1200px'
        }}
      >
        {/* Disclaimer */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            sx={{ 
              fontWeight: 600,
              color: '#333',
              mb: 1.5,
              fontSize: '0.7rem'
            }}
          >
            Disclaimer
          </Typography>
          <Typography 
            sx={{ 
              color: '#666',
              lineHeight: 1.3,
              textAlign: 'justify',
              fontSize: '0.65rem'
            }}
          >
            Under no circumstance we will require you to pay in order to release any type of product, including credit
            cards, loans or any other offer. If this happens, please contact us immediately. Always read the terms and
            conditions of the service provider you are reaching out to. We make money from advertising and referrals for
            some but not all products displayed in this website. Everything published here is based on quantitative and
            qualitative research, and our team strives to be as fair as possible when comparing competing options.
          </Typography>
        </Box>

        {/* Advertiser Disclosure */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            sx={{ 
              fontWeight: 600,
              color: '#333',
              mb: 1.5,
              fontSize: '0.7rem'
            }}
          >
            Advertiser Disclosure
          </Typography>
          <Typography 
            sx={{ 
              color: '#666',
              lineHeight: 1.3,
              textAlign: 'justify',
              fontSize: '0.65rem'
            }}
          >
            We are an independent, objective, advertising-supported content publisher website. In order to support our
            ability to provide free content to our users, the recommendations that appear on our site might be from
            companies from which we receive affiliate compensation. Such compensation may impact how, where and in which
            order offers appear on our site. Other factors such as our own proprietary algorithms and first party data may
            also affect how and where products/offers are placed. We do not include all currently available financial or
            credit offers in the market in our website.
          </Typography>
        </Box>

        {/* Editorial Note */}
        <Box>
          <Typography 
            sx={{ 
              fontWeight: 600,
              color: '#333',
              mb: 1.5,
              fontSize: '0.7rem'
            }}
          >
            Editorial Note
          </Typography>
          <Typography 
            sx={{ 
              color: '#666',
              lineHeight: 1.3,
              textAlign: 'justify',
              fontSize: '0.65rem'
            }}
          >
            Opinions expressed here are the author`s alone, not those of any bank, credit card issuer, hotel, airline, or
            other entity. This content has not been reviewed, approved, or otherwise endorsed by any of the entities
            included within the post. That said, the compensation we receive from our affiliate partners does not influence
            the recommendations or advice our team of writers provides in our articles or otherwise impact any of the
            content on this website. While we work hard to provide accurate and up to date information that we believe our
            users will find relevant, we cannot guarantee that any information provided is complete and makes no
            representations or warranties in connection thereto, nor to the accuracy or applicability thereof.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}