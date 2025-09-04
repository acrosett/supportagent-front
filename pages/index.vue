<template>
  <div>
    <h1>Overview</h1>
    <p>Welcome to PeekMe! This is your dashboard overview where you can see key metrics and recent activity.</p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Templates</h3>
        <p class="stat-number">12</p>
      </div>
      <div class="stat-card">
        <h3>Active Projects</h3>
        <p class="stat-number">3</p>
      </div>
      <div class="stat-card">
        <h3>Last Updated</h3>
        <p class="stat-number">2 days ago</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(103, 102, 241, 0.1);
}

.stat-card:hover {
  box-shadow: 0 8px 25px rgba(103, 102, 241, 0.15);
  border-color: #a855f7;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-number {
  margin: 0;
  color: #4338ca;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>