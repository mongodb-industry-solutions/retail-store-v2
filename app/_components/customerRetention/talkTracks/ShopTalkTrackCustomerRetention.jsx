import React from 'react'
import { Container } from 'react-bootstrap'
import './talkTracks.css'

const ShopTalkTrackCustomerRetention = ({ section }) => {
  
  if (section === 1) {
    return (
      <div>
        <h3>How To Demo</h3>
        <p>Instructions on how to demonstrate the customer retention feature...</p>
        {/* Add your How To content here */}
      </div>
    )
  }
  
  if (section === 2) {
    return (
      <div>
        <h3>Behind the Scenes</h3>
        <p>Technical details about how the customer retention system works...</p>
        {/* Add your Behind the Scenes content here */}
      </div>
    )
  }
  
  if (section === 3) {
    const challenges = [
      {
        title: 'The Need for "In the Moment" Anticipation',
        desc: 'Retention strategies can no longer rely on reactive measures, sent after a cart is abandoned. By the time these after-the-fact communications are sent, the customer has likely already purchased the product elsewhere.'
      },
      {
        title: 'Complex Online Behaviors', 
        desc: 'The reasons for customer hesitation are multifaceted and difficult to diagnose in real-time.'
      },
      {
        title: 'The Failure of Traditional Analytics',
        desc: 'Traditional analytics often rely on batch data processing, which fails to capture the "immediacy" of shopping behaviors. Retailers struggle to evaluate and act on behavioral data in a timeframe to prevent customers from clicking away.'
      },
      {
        title: 'Misaligned Resource Allocation',
        desc: 'A 2024 report noted that marketers spend nearly 20% more on acquiring customers than retaining them, often prioritizing fresh traffic over protecting existing relationships.'
      }
    ];

    const interventions = [
      {
        action: 'Shopper adds items to cart but remains active without checking out',
        consequence: 'System can proactively offer checkout assistance'
      },
      {
        action: 'Search friction detected - browsing multiple similar products without engagement',
        consequence: 'System can dynamically refine the experience by re-ranking results, highlighting bestsellers, or applying intelligent filters based on observed preferences'
      },
      {
        action: 'Shopper spends significant time viewing a product, showing high shopping intent, without adding to cart',
        consequence: 'System can surface recommendation widget highlighting similar/complementary products, social proof (reviews), or availability signals (low stock, delivery ETA) to reduce hesitation'
      }
    ];

    return (
      <div className="customer-retention-container">
        <h2 className="main-title">Customer Retention</h2>
        <p className="intro-text">
          Customer retention is essential in the retail landscape. Industry research has shown that retaining existing customers is far more cost-effective than acquiring new ones. What's more, returning customers tend to purchase more frequently, spend more per transaction, and are far more likely to recommend the brand to others.
        </p>
        
        <p className="intro-text">
          A 2024 report by The CMO Survey notes how <span className="stat-highlight"><a href="https://cmosurvey.org/wp-content/uploads/2024/11/The_CMO_Survey-Highlights_and_Insights_Report-Fall_2024.pdf" target="_blank" rel="noopener noreferrer" className="stat-link">marketers spend "19.6% more on acquiring customers than retaining them."</a></span>
        </p>
        
        <p className="intro-text">
          <span className="stat-highlight"><a href="https://www.vennapps.com/blog/ecommerce-customer-retention-statistics" target="_blank" rel="noopener noreferrer" className="stat-link">Returning customers spend about 67% more than first-time buyers over time.</a></span>
        </p>

        <h3 className="section-title">Challenges for Successful Customer Retention Strategies in a Digital World</h3>
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
          Customers expect retailers to anticipate their needs and intervene while they are still actively engaged. To respond effectively, retailers must act on behavioral signals in real time and in ways that are contextually relevant to the customer's journey.
        </p>
        
        <div className="interventions-container">
          <h4 className="interventions-title">Automated real-time interventions to improve retention</h4>
          <div className="interventions-grid">
            {interventions.map((intervention, idx) => (
              <div key={idx} className="intervention-card">
                <div className="intervention-action">
                  {intervention.action}
                </div>
                <div className="intervention-arrow">
                  →
                </div>
                <div className="intervention-consequence">
                  {intervention.consequence}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="cta-box">
          <strong>Discover what Next Best Actions are triggered in this demo when browsing through the ecommerce catalog!</strong>
        </div>
      </div>
    )
  }
  if (section === 4) {
    const mongoAdvantages = [
      {
        title: 'Well suited for Real-Time Data Processing (The "Latency" Advantage)',
        desc: 'Event data is generated in high volumes and at high velocity, and the ability to process it immediately is essential for engaging customers <em>before</em> they abandon a session. Unlike traditional systems that rely on batch processing, MongoDB is designed to ingest, process, and act on behavioral data within milliseconds.',
        details: [
          'How it works: Features like <a href="https://www.mongodb.com/resources/products/capabilities/database-triggers" target="_blank" rel="noopener noreferrer">MongoDB Atlas Triggers</a> and <a href="https://www.mongodb.com/docs/manual/changeStreams/" target="_blank" rel="noopener noreferrer">change streams</a> monitor specific user signals and react the instant a threshold is crossed.',
          'The Benefit: This allows you to move from reactive "damage control" to proactive intervention'
        ]
      },
      {
        title: 'Well suited for Real-Time Event Analysis (The "Insight" Advantage)',
        desc: 'Beyond simply moving data fast, MongoDB excels at <a href="https://www.mongodb.com/resources/products/platform/event-stream-processing#faqs" target="_blank" rel="noopener noreferrer">Complex Event Processing (CEP)</a>. This capability allows you to extract deep information and identify patterns from event streams as they arrive, rather than waiting for them to be stored and indexed first.',
        details: [
          'How it works: While <a href="https://www.mongodb.com/resources/products/platform/event-stream-processing#faqs" target="_blank" rel="noopener noreferrer">Simple Event Processing (SEP)</a> looks at individual clicks, CEP analyzes patterns of events,. Using <a href="https://www.mongodb.com/docs/atlas/atlas-stream-processing/" target="_blank" rel="noopener noreferrer">Atlas Stream Processing (ASP)</a> and the <a href="https://www.mongodb.com/docs/atlas/atlas-ui/triggers/functions/aggregate/" target="_blank" rel="noopener noreferrer">Aggregation Framework</a>, the system can detect complex behaviors like "search friction" or "indecision" sequences in real time.',
          'The Benefit: It simplifies the path to insight by eliminating the need for complex ETL jobs or separate analytics engines. Ensuring that decisions are based on what is happening now, not what happened yesterday.'
        ]
      },
      {
        title: 'Enables "Intelligent" AI-Powered Interventions',
        desc: 'Speed alone is not enough; retention strategies must be smart to avoid annoying the customer. MongoDB integrates directly with AI pipelines to enrich raw events with intelligence, allowing the system to distinguish between genuine hesitation and casual browsing.',
        details: [
          'Key Enabler: By using <a href="https://www.mongodb.com/lp/cloud/atlas/search?utm_source=google&utm_campaign=search_gs_pl_evergreen_atlas-search_product_prosp-brand_gic-null_ww-multi_ps-all_desktop_eng_lead&utm_term=atlas%20search&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=15228226499&adgroup=129982058535&cq_cmp=15228226499&gad_source=1&gad_campaignid=15228226499&gbraid=0AAAAADQ140115gzWO9GaaC2d4hN8UcTcu&gclid=CjwKCAiAj8LLBhAkEiwAJjbY70zghOh3snzhkdm1lGgSvnRlvUecvQvnkH-ANkgNaBJKZc0L9qDfYBoCNeoQAvD_BwE" target="_blank" rel="noopener noreferrer">Atlas Search</a> and embedded AI agents, the platform can prevent system abuse (e.g., detecting users who abandon carts solely to fish for discounts) and instantly retrieve relevant product recommendations without needing a separate search engine,.'
        ]
      }
    ];

    return (
      <div className="customer-retention-container">
        <h2 className="main-title">Why use MongoDB for customer retention strategies?</h2>
        
        <div className="challenges-grid">
          {mongoAdvantages.map((advantage, idx) => (
            <div key={idx} className="challenge-card">
              <strong className="challenge-title">{advantage.title}</strong>
              <div className="challenge-desc" dangerouslySetInnerHTML={{__html: advantage.desc}}></div>
              <div className="advantage-details">
                {advantage.details.map((detail, detailIdx) => (
                  <div key={detailIdx} className={`advantage-detail ${detail.startsWith('How it works:') ? 'how-it-works' : detail.startsWith('The Benefit:') ? 'the-benefit' : detail.startsWith('Key Enabler:') ? 'key-enabler' : ''}`}>
                    <span dangerouslySetInnerHTML={{__html: detail.replace(/^(How it works:|The Benefit:|Key Enabler:)/, '<strong>$1</strong>')}} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
    return null;

}

export default ShopTalkTrackCustomerRetention