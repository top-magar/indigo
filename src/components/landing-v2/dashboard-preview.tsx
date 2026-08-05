export function DashboardPreview() {
  return (
    <div className="lv2-dashboard lv2-grid-bg" aria-hidden>
      <div className="lv2-dashboard__bar">
        <div className="lv2-dash-dots">
          <i />
          <i />
          <i />
        </div>
        <div className="lv2-dashboard__url">analytics.indigo.com/storefront</div>
        <div className="lv2-live-badge">
          <span className="lv2-dot lv2-dot--pulse" />
          Live
        </div>
      </div>
      <div className="lv2-dashboard__body">
        <aside className="lv2-dashboard__rail">
          <div className="lv2-rail-item lv2-rail-item--active">Overview</div>
          <div className="lv2-rail-item">Funnels</div>
          <div className="lv2-rail-item">Products</div>
          <div className="lv2-rail-item">Customers</div>
          <div className="lv2-rail-item">Campaigns</div>
        </aside>
        <div className="lv2-dashboard__main">
          <div className="lv2-kpi-row">
            <div className="lv2-kpi">
              <div className="lv2-kpi__label">Active sessions</div>
              <div className="lv2-kpi__value">8,492</div>
              <div className="lv2-kpi__delta lv2-kpi__delta--up">↑ 18.4%</div>
            </div>
            <div className="lv2-kpi">
              <div className="lv2-kpi__label">Checkouts</div>
              <div className="lv2-kpi__value">1,247</div>
              <div className="lv2-kpi__delta lv2-kpi__delta--up">↑ 12.2%</div>
            </div>
            <div className="lv2-kpi">
              <div className="lv2-kpi__label">Conversion</div>
              <div className="lv2-kpi__value">4.8%</div>
              <div className="lv2-kpi__delta lv2-kpi__delta--up">↑ 0.6%</div>
            </div>
            <div className="lv2-kpi">
              <div className="lv2-kpi__label">Revenue</div>
              <div className="lv2-kpi__value">NPR 4.8M</div>
              <div className="lv2-kpi__delta lv2-kpi__delta--up">↑ 24%</div>
            </div>
          </div>

          <div className="lv2-dash-grid">
            <div className="lv2-dash-panel">
              <div className="lv2-dash-panel__head">
                <strong>Revenue trend</strong>
                <span>Last 7 days</span>
              </div>
              <svg viewBox="0 0 700 180" width="100%" height="180" fill="none" aria-hidden>
                <defs>
                  <linearGradient id="lv2-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--lv2-accent)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--lv2-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 140 50 126 100 132 150 112 200 118 250 92 300 102 350 78 400 86 450 56 500 68 550 40 600 52 650 32 700 24"
                  stroke="var(--lv2-highlight)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 140 50 126 100 132 150 112 200 118 250 92 300 102 350 78 400 86 450 56 500 68 550 40 600 52 650 32 700 24 700 180 0 180Z"
                  fill="url(#lv2-area)"
                />
              </svg>
            </div>

            <div className="lv2-dash-panel">
              <div className="lv2-dash-panel__head">
                <strong>Traffic channels</strong>
                <span>Primary sources</span>
              </div>
              <div className="lv2-bars">
                <div className="lv2-bars__row">
                  <span>Organic</span>
                  <div className="lv2-bars__track"><div className="lv2-bars__fill" style={{ width: "82%" }} /></div>
                  <strong>82%</strong>
                </div>
                <div className="lv2-bars__row">
                  <span>Paid</span>
                  <div className="lv2-bars__track"><div className="lv2-bars__fill" style={{ width: "61%" }} /></div>
                  <strong>61%</strong>
                </div>
                <div className="lv2-bars__row">
                  <span>Email</span>
                  <div className="lv2-bars__track"><div className="lv2-bars__fill" style={{ width: "48%" }} /></div>
                  <strong>48%</strong>
                </div>
                <div className="lv2-bars__row">
                  <span>Social</span>
                  <div className="lv2-bars__track"><div className="lv2-bars__fill" style={{ width: "34%" }} /></div>
                  <strong>34%</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="lv2-dash-panel">
            <div className="lv2-dash-panel__head">
              <strong>Recent events</strong>
              <span>Sample feed</span>
            </div>
            <table className="lv2-dash-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Visitor</th>
                  <th>Value</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>page_view</td>
                  <td>visitor_849</td>
                  <td>-</td>
                  <td>2s ago</td>
                </tr>
                <tr>
                  <td>add_to_cart</td>
                  <td>visitor_1,247</td>
                  <td>NPR 1,200</td>
                  <td>18s ago</td>
                </tr>
                <tr>
                  <td>purchase</td>
                  <td>customer_118</td>
                  <td>NPR 3,850</td>
                  <td>1m ago</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="lv2-ai-card">
            <strong>
              <span className="lv2-dot lv2-dot--pulse" aria-hidden /> AI insight
            </strong>
            <p>Cart completions are highest between 20:30–21:45 on weekdays. Promote COD reminders 30 minutes before this window.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
