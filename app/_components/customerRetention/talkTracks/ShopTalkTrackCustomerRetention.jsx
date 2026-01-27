import React from "react";
import "./talkTracks.css";
import Icon from "@leafygreen-ui/icon";
import Image from "next/image";

const ShopTalkTrackCustomerRetention = ({ section }) => {
  if (section === 1) {
    const eventTypes = [
      {
        event: "View product",
        action: "Click a product card to open its detailed view",
        represents: "Product-level interest and intent discovery.",
      },
      {
        event: "Add to cart",
        action:
          "Click the Add to Cart button found inside the details of the product.",
        represents: "Strong purchase intent signal.",
      },
      {
        event: "Exit intent",
        action: (
          <span>
            Click on the <Icon glyph="LogOut" size="large" fill="red" /> icon at
            the rightmost side of the navbar, and hover your mouse over the "Log
            out" area.
          </span>
        ),
        represents: "Potential abandonment risk.",
      },
      {
        event: "Heartbeat",
        action: "No action needed, sent periodically (every ~10 seconds).",
        represents: "Continued session presence and activity.",
      },
    ];

    const signalTypes = [
      {
        signal: "High Intent",
        represents: "The customer is actively considering a specific purchase",
        matters: "Opportunity to remove doubt and accelerate conversion",
      },
      {
        signal: "Search Friction",
        represents:
          "The customer is trying to find something but isn't progressing",
        matters:
          "Best moment to help before frustration turns into abandonment",
      },
      {
        signal: "Exit Risk",
        represents: "The customer is likely to leave without converting",
        matters:
          "Last chance to retain (recover cart, save intent, assist immediately)",
      },
    ];

    return (
      <div className="customer-retention-container-tt">
        <h1 className="main-title">Understanding this page</h1>

        <p className="intro-text">
          In this page we are demonstrating how the Leafy PopUp ecommerce
          captures and analyses real-time customer behaviour while browsing
          through the catalog. And generate reactive measures in the form of
          Next Best Actions, to keep the customer engaged and retain them.
        </p>

        <p className="intro-text">
          The system captures customer behavior events during an active user
          session to enable real-time processing and trigger Next Best Actions
        </p>

        <div className="demo-controls">
          <div className="control-item">
            <Icon glyph={"NavExpand"} /> Toggles a sidebar that showcases some
            of the behind the scenes collections and processes happening in the
            back.
          </div>
          <div className="control-item">
            <Icon glyph={"Bell"} /> Opens the notifications menu where we are
            displaying the 'Next Best Actions (NBA)' generated. NBA are all
            centralized on this notification menu, however some of them can be
            present in other places like the product details to show another
            example of what the NBA can trigger/do.
          </div>
        </div>

        <h2 className="section-title">1. UX events streams</h2>
        <h3 className="section-subtitle">
          Sending real-time heartbeats and action based events
        </h3>

        <p className="intro-text">
          In retail and digital commerce systems, customer behavior is typically
          observed through:
        </p>
        <ul className="behavior-list">
          <li>Action-based events (clicks, navigation, cart interactions)</li>
          <li>
            Lightweight engagement signals to indicate session presence and
            activity
          </li>
        </ul>

        <p className="intro-text">
          Perform any of the actions mentioned in the table above and map them
          to the "UX events streams" section on the right side. Click on the{" "}
          <Icon glyph="CurlyBraces" /> icon to see the full document.
        </p>

        <table
          className="events-table"
          style={{
            border: "1px solid #ccc",
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Event type
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Perform the following to emit this event
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                }}
              >
                What it represents
              </th>
            </tr>
          </thead>
          <tbody>
            {eventTypes.map((eventType, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <strong>{eventType.event}</strong>
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {eventType.action}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {eventType.represents}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2">
          <Image
            src="/rsc/images/customerRetention/events.png"
            alt="Events section placeholder"
            width={400}
            height={250}
            style={{
              width: "400px",
              height: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <h2 className="section-title">2. Customer behaviour signals</h2>
        <h3 className="section-subtitle">
          Finding Complex Event Patterns (CEP) from the events to identify
          customer behaviour signals
        </h3>

        <p className="intro-text">
          This section will start auto populating as you continue to interact on
          this page.
        </p>

        <p className="intro-text">
          In this demo we have three possible signal types identified.
        </p>

        <table
          className="signals-table"
          style={{
            border: "1px solid #ccc",
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Signal Type
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                }}
              >
                What it represents
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Why it matters
              </th>
            </tr>
          </thead>
          <tbody>
            {signalTypes.map((signalType, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <strong>{signalType.signal}</strong>
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {signalType.represents}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {signalType.matters}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="intro-text">
          It's important to note that signals are not calculated on linear rules
          but, based on a behavioral algorithm that looks at intensity and
          direction in user behavior.
        </p>

        <p className="intro-text">
          You can see these signals listed inside the 'Customer behaviour
          signals' section, click on the <Icon glyph="CurlyBraces" /> icon to
          see the full document.
        </p>

        <div className="mt-2">
          <Image
            src="/rsc/images/customerRetention/customerBehaviours.png"
            alt="Customer behaviour signals placeholder"
            width={400}
            height={250}
            style={{
              width: "400px",
              height: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <h2 className="section-title">3. Agent reasoning</h2>
        <p className="intro-text">
          A lightweight agent takes the session signals and decides which is the
          best Next Best Action.
        </p>

        <p className="intro-text">
          In this demo we have three possible Next Best Action types from which
          the agent can pick based on the signals that it reads.
        </p>

        <h2 className="section-title">4. Next Best Action decisions</h2>
        <h3 className="section-subtitle">
          The Next Best actions generated by the agent
        </h3>

        <p className="intro-text">
          This section will start auto populating as the agent creates Next Best
          Actions to send to the customer.
        </p>

        <p className="intro-text">
          You will see the Next Best Actions listed inside this section.
        </p>

        <div className="mt-2">
          <Image
            src="/rsc/images/customerRetention/nextBestAction.png"
            alt="Next Best Actions placeholder"
            width={400}
            height={250}
            style={{
              width: "400px",
              height: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <h3 className="section-subtitle">
          How will the customer look at this NBAs?
        </h3>

        <p className="intro-text">
          NBAs are displayed inside the navbar as Notifications
        </p>
        <div className="mt-2">
          <Image
            src="/rsc/images/customerRetention/notifications.png"
            alt="NBA notifications placeholder"
            width={400}
            height={250}
            style={{
              width: "400px",
              height: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <p className="intro-text">
          Also for some NBA that are for a specific product, in addition to the
          notification you will be able to see it inside the product details as
          well as with a
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill="#6c3036"
            className="me-2"
            viewBox="0 0 16 16"
          >
            <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15" />
          </svg>
          icon on the product card.
        </p>
        <div className="mt-2">
          <Image
            src="/rsc/images/customerRetention/embedNotification.png"
            alt="Embedded NBA notification placeholder"
            width={400}
            height={250}
            style={{
              width: "400px",
              height: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <h1 className="main-title mt-2">Demo Walkthrough (What you show)</h1>

        <div className="scenarios-container">
          <div className="scenario-card">
            <h3 className="scenario-title">Scenario 1 — High Intent</h3>
            <div className="scenario-sequence">
              <strong>Sequence:</strong> search → view-product → add-to-cart
              (same category/topic)
            </div>
            <div className="scenario-show">
              <strong>Show:</strong>
              <ul>
                <li>baseline high intent detection</li>
                <li>
                  Decision layer writes NBA: "Complete your purchase" or
                  "Recommended matching item"
                </li>
              </ul>
            </div>
          </div>

          <div className="scenario-card">
            <h3 className="scenario-title">Scenario 2 — Search Friction</h3>
            <div className="scenario-sequence">
              <strong>Sequence:</strong> search → search → search without
              cart/progress
            </div>
            <div className="scenario-show">
              <strong>Show:</strong>
              <ul>
                <li>baseline friction detection</li>
                <li>
                  Decision layer writes NBA: recommendations or top alternative
                  items
                </li>
              </ul>
            </div>
          </div>

          <div className="scenario-card">
            <h3 className="scenario-title">Scenario 3 — Exit Risk</h3>
            <div className="scenario-sequence">
              <strong>Sequence:</strong> add-to-cart then exit-intent
            </div>
            <div className="scenario-show">
              <strong>Show:</strong>
              <ul>
                <li>urgent signal</li>
                <li>
                  Decision layer writes NBA: "Don't forget your cart" or similar
                  retention action
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === 2) {
    return (
      <div>
        <h3>Behind the Scenes</h3>
        <p>
          Technical details about how the customer retention system works...
        </p>
        {/* Add your Behind the Scenes content here */}
      </div>
    );
  }

  if (section === 3) {
    const challenges = [
      {
        title: 'The Need for "In the Moment" Anticipation',
        desc: "Retention strategies can no longer rely on reactive measures, sent after a cart is abandoned. By the time these after-the-fact communications are sent, the customer has likely already purchased the product elsewhere.",
      },
      {
        title: "Complex Online Behaviors",
        desc: "The reasons for customer hesitation are multifaceted and difficult to diagnose in real-time.",
      },
      {
        title: "The Failure of Traditional Analytics",
        desc: 'Traditional analytics often rely on batch data processing, which fails to capture the "immediacy" of shopping behaviors. Retailers struggle to evaluate and act on behavioral data in a timeframe to prevent customers from clicking away.',
      },
      {
        title: "Misaligned Resource Allocation",
        desc: "A 2024 report noted that marketers spend nearly 20% more on acquiring customers than retaining them, often prioritizing fresh traffic over protecting existing relationships.",
      },
    ];

    const interventions = [
      {
        action:
          "Shopper adds items to cart but remains active without checking out",
        consequence: "System can proactively offer checkout assistance",
      },
      {
        action:
          "Search friction detected - browsing multiple similar products without engagement",
        consequence:
          "System can dynamically refine the experience by re-ranking results, highlighting bestsellers, or applying intelligent filters based on observed preferences",
      },
      {
        action:
          "Shopper spends significant time viewing a product, showing high shopping intent, without adding to cart",
        consequence:
          "System can surface recommendation widget highlighting similar/complementary products, social proof (reviews), or availability signals (low stock, delivery ETA) to reduce hesitation",
      },
    ];

    return (
      <div className="customer-retention-container-tt">
        <h2 className="main-title">Customer Retention</h2>
        <p className="intro-text">
          Customer retention is essential in the retail landscape. Industry
          research has shown that retaining existing customers is far more
          cost-effective than acquiring new ones. What's more, returning
          customers tend to purchase more frequently, spend more per
          transaction, and are far more likely to recommend the brand to others.
        </p>

        <p className="intro-text">
          A 2024 report by The CMO Survey notes how{" "}
          <span className="stat-highlight">
            <a
              href="https://cmosurvey.org/wp-content/uploads/2024/11/The_CMO_Survey-Highlights_and_Insights_Report-Fall_2024.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="stat-link"
            >
              marketers spend "19.6% more on acquiring customers than retaining
              them."
            </a>
          </span>
        </p>

        <p className="intro-text">
          <span className="stat-highlight">
            <a
              href="https://www.vennapps.com/blog/ecommerce-customer-retention-statistics"
              target="_blank"
              rel="noopener noreferrer"
              className="stat-link"
            >
              Returning customers spend about 67% more than first-time buyers
              over time.
            </a>
          </span>
        </p>

        <h3 className="section-title">
          Challenges for Successful Customer Retention Strategies in a Digital
          World
        </h3>
        <div className="challenges-grid">
          {challenges.map((challenge, idx) => (
            <div key={idx} className="challenge-card">
              <strong className="challenge-title">{challenge.title}</strong>
              <div className="challenge-desc">{challenge.desc}</div>
            </div>
          ))}
        </div>

        <h3 className="section-title">Improve Retention with Automation</h3>
        <p className="intro-text">
          Customers expect retailers to anticipate their needs and intervene
          while they are still actively engaged. To respond effectively,
          retailers must act on behavioral signals in real time and in ways that
          are contextually relevant to the customer's journey.
        </p>

        <div className="interventions-container">
          <h4 className="interventions-title">
            Automated real-time interventions to improve retention
          </h4>
          <div className="interventions-grid">
            {interventions.map((intervention, idx) => (
              <div key={idx} className="intervention-card">
                <div className="intervention-action">{intervention.action}</div>
                <div className="intervention-arrow">→</div>
                <div className="intervention-consequence">
                  {intervention.consequence}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cta-box">
          <strong>
            Discover what Next Best Actions are triggered in this demo when
            browsing through the ecommerce catalog!
          </strong>
        </div>
      </div>
    );
  }
  if (section === 4) {
    const mongoAdvantages = [
      {
        title:
          'Well suited for Real-Time Data Processing (The "Latency" Advantage)',
        desc: "Event data is generated in high volumes and at high velocity, and the ability to process it immediately is essential for engaging customers <em>before</em> they abandon a session. Unlike traditional systems that rely on batch processing, MongoDB is designed to ingest, process, and act on behavioral data within milliseconds.",
        details: [
          'How it works: Features like <a href="https://www.mongodb.com/resources/products/capabilities/database-triggers" target="_blank" rel="noopener noreferrer">MongoDB Atlas Triggers</a> and <a href="https://www.mongodb.com/docs/manual/changeStreams/" target="_blank" rel="noopener noreferrer">change streams</a> monitor specific user signals and react the instant a threshold is crossed.',
          'The Benefit: This allows you to move from reactive "damage control" to proactive intervention',
        ],
      },
      {
        title:
          'Well suited for Real-Time Event Analysis (The "Insight" Advantage)',
        desc: 'Beyond simply moving data fast, MongoDB excels at <a href="https://www.mongodb.com/resources/products/platform/event-stream-processing#faqs" target="_blank" rel="noopener noreferrer">Complex Event Processing (CEP)</a>. This capability allows you to extract deep information and identify patterns from event streams as they arrive, rather than waiting for them to be stored and indexed first.',
        details: [
          'How it works: While <a href="https://www.mongodb.com/resources/products/platform/event-stream-processing#faqs" target="_blank" rel="noopener noreferrer">Simple Event Processing (SEP)</a> looks at individual clicks, CEP analyzes patterns of events,. Using <a href="https://www.mongodb.com/docs/atlas/atlas-stream-processing/" target="_blank" rel="noopener noreferrer">Atlas Stream Processing (ASP)</a> and the <a href="https://www.mongodb.com/docs/atlas/atlas-ui/triggers/functions/aggregate/" target="_blank" rel="noopener noreferrer">Aggregation Framework</a>, the system can detect complex behaviors like "search friction" or "indecision" sequences in real time.',
          "The Benefit: It simplifies the path to insight by eliminating the need for complex ETL jobs or separate analytics engines. Ensuring that decisions are based on what is happening now, not what happened yesterday.",
        ],
      },
      {
        title: 'Enables "Intelligent" AI-Powered Interventions',
        desc: "Speed alone is not enough; retention strategies must be smart to avoid annoying the customer. MongoDB integrates directly with AI pipelines to enrich raw events with intelligence, allowing the system to distinguish between genuine hesitation and casual browsing.",
        details: [
          'Key Enabler: By using <a href="https://www.mongodb.com/lp/cloud/atlas/search?utm_source=google&utm_campaign=search_gs_pl_evergreen_atlas-search_product_prosp-brand_gic-null_ww-multi_ps-all_desktop_eng_lead&utm_term=atlas%20search&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=15228226499&adgroup=129982058535&cq_cmp=15228226499&gad_source=1&gad_campaignid=15228226499&gbraid=0AAAAADQ140115gzWO9GaaC2d4hN8UcTcu&gclid=CjwKCAiAj8LLBhAkEiwAJjbY70zghOh3snzhkdm1lGgSvnRlvUecvQvnkH-ANkgNaBJKZc0L9qDfYBoCNeoQAvD_BwE" target="_blank" rel="noopener noreferrer">Atlas Search</a> and embedded AI agents, the platform can prevent system abuse (e.g., detecting users who abandon carts solely to fish for discounts) and instantly retrieve relevant product recommendations without needing a separate search engine,.',
        ],
      },
    ];

    return (
      <div className="customer-retention-container-tt">
        <h2 className="main-title">
          Why use MongoDB for customer retention strategies?
        </h2>

        <div className="challenges-grid">
          {mongoAdvantages.map((advantage, idx) => (
            <div key={idx} className="challenge-card">
              <strong className="challenge-title">{advantage.title}</strong>
              <div
                className="challenge-desc"
                dangerouslySetInnerHTML={{ __html: advantage.desc }}
              ></div>
              <div className="advantage-details">
                {advantage.details.map((detail, detailIdx) => (
                  <div
                    key={detailIdx}
                    className={`advantage-detail ${detail.startsWith("How it works:") ? "how-it-works" : detail.startsWith("The Benefit:") ? "the-benefit" : detail.startsWith("Key Enabler:") ? "key-enabler" : ""}`}
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: detail.replace(
                          /^(How it works:|The Benefit:|Key Enabler:)/,
                          "<strong>$1</strong>"
                        ),
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default ShopTalkTrackCustomerRetention;
