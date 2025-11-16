import React from 'react';
import { Box, H2, Text, Table, TableRow, TableCell } from '@adminjs/design-system';

const SummaryCard = ({ label, value }) => (
  <Box variant="white" boxShadow="card" padding="xl" borderRadius="lg">
    <Text color="grey60" mb="sm">
      {label}
    </Text>
    <H2>{value}</H2>
  </Box>
);

const Dashboard = (props) => {
  const { summary = {}, recentOrders = [], currentAdmin = {} } = props;
  const isAdmin = currentAdmin.role === 'admin';

  return (
    <Box>
      <H2>Welcome back, {currentAdmin.name || currentAdmin.email}</H2>
      <Text mb="xxl">
        {isAdmin
          ? 'Here is a quick overview of how your store is performing today.'
          : 'Here is a snapshot of your latest activity.'}
      </Text>

      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap="lg">
        {isAdmin ? (
          <>
            <SummaryCard label="Total Users" value={summary.totalUsers ?? 0} />
            <SummaryCard label="Total Orders" value={summary.totalOrders ?? 0} />
            <SummaryCard label="Total Products" value={summary.totalProducts ?? 0} />
            <SummaryCard label="Revenue" value={`$${summary.totalRevenue?.toFixed(2) ?? '0.00'}`} />
          </>
        ) : (
          <>
            <SummaryCard label="Orders" value={summary.totalOrders ?? 0} />
            <SummaryCard label="Total Spent" value={`$${summary.totalRevenue?.toFixed(2) ?? '0.00'}`} />
          </>
        )}
      </Box>

      {recentOrders.length > 0 ? (
        <Box mt="xl">
          <H2>{isAdmin ? 'Recent Orders' : 'Your Recent Orders'}</H2>
          <Table>
            <thead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                {isAdmin && <TableCell>Customer</TableCell>}
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.reference}</TableCell>
                  {isAdmin && <TableCell>{order.customer}</TableCell>}
                  <TableCell>{order.status}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </Box>
      ) : (
        <Text mt="xl">No orders found yet.</Text>
      )}
    </Box>
  );
};

export default Dashboard;
