import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import { Box, H2, Text, Table, TableRow, TableCell } from '@adminjs/design-system';

const api = new ApiClient();

const SummaryCard = ({ label, value }) => (
  <Box variant="white" boxShadow="card" padding="xl" borderRadius="lg">
    <Text color="grey60" mb="sm">
      {label}
    </Text>
    <H2>{value}</H2>
  </Box>
);

const formatCurrency = (value) => `LKR${Number(value ?? 0).toFixed(2)}`;

const Dashboard = () => {
  const [data, setData] = useState({ summary: {}, recentOrders: [], currentAdmin: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const response = await api.getDashboard();
        if (mounted) {
          setData(response.data ?? {});
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const { summary = {}, recentOrders = [], currentAdmin = {} } = data;
  const isAdmin = currentAdmin.role === 'admin';

  if (loading) {
    return (
      <Box>
        <Text>Loading dashboard...</Text>
      </Box>
    );
  }

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
            <SummaryCard label="Revenue" value={formatCurrency(summary.totalRevenue)} />
          </>
        ) : (
          <>
            <SummaryCard label="Orders" value={summary.totalOrders ?? 0} />
            <SummaryCard label="Total Spent" value={formatCurrency(summary.totalRevenue)} />
          </>
        )}
      </Box>

      {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
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
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
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
