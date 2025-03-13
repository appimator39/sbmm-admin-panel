import { Helmet } from 'react-helmet-async';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { NotificationCard } from 'src/sections/home/notification-card';
import { OrganizationCard } from 'src/sections/home/organization-card';

// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <NotificationCard />
          </Grid>
          <Grid item xs={12} md={8}>
            <OrganizationCard />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
