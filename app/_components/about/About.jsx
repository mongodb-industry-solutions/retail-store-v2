
"use client";

import "../../fonts.css";
import styles from "./about.module.css";
import TeamCard from "../teamcard/TeamCard";
import Disclaimer from "../disclaimer/Disclaimer";

import Button from "@leafygreen-ui/button";
import { H1, H3, Body } from '@leafygreen-ui/typography';
import { Container } from "react-bootstrap";
//import Link from "next/link";

const About = () => {

  const githubRepoUrl = "https://github.com/mongodb-industry-solutions/retail-store-v2";
  const githubRepoMSUrl = "https://github.com/mongodb-industry-solutions/retail-digital-receipts-backend";

  return (

    <Container>
      <H1>About</H1>
      <div className={styles.firstSection}>
        <div className={styles.disclaimer}>
          <Body className={styles.body}>
            This ecommerce platform serves as a showcase for the powerful features and capabilities of MongoDB.
            The products, prices, and any other content on this site are entirely fictional and do not represent a real business. No actual transactions or purchases can be made on this platform.
            <br></br>
            <br></br>
            Thank you for joining us in this demo experience, and we hope you enjoy exploring the capabilities of MongoDB!
          </Body>
          <Disclaimer/>
        </div>
        <div>
          <img className={styles.aboutImg} src="/aboutillo.png"></img>
        </div>
      </div>
      <H3>Team</H3>
      <div className={styles.teamcards}>
        <TeamCard
          photo="/rsc/images/team/gen.png"
          name="Genevieve Broadhead"
          title="Global Lead, Retail Solutions"
          subtitle="Product Owner"
        />
        <TeamCard
          photo="/rsc/images/team/prashant.png"
          name="Prashant Juttukonda"
          title="Retail Principal, Industry Solutions"
          subtitle="Product Owner"
        />
        <TeamCard
          photo="/rsc/images/team/rodri.png"
          name="Rodrigo Leal"
          title="Retail Principal, Industry Solutions"
          subtitle="Product Owner"
        />
        <TeamCard
          photo="/rsc/images/team/angie.jpeg"
          name="Angie Güemes"
          title="Sr. Specialist, Industry Solutions"
          subtitle="Full Stack Developer"
        />

        <TeamCard
          photo="/rsc/images/team/flor.png"
          name="Flor Arín"
          title="Sr. Specialist, Industry Solutions"
          subtitle="Full Stack Developer"
        />

        <TeamCard
          photo="/rsc/images/team/pedro.png"
          name="Pedro Bereilh"
          title="Sr. Specialist, Industry Solutions"
          subtitle="Cloud Engineer"
        />
        <TeamCard
          photo="/rsc/images/team/ainhoa.png"
          name="Ainhoa Mugica"
          title="Consultant, Industry Solutions"
          subtitle="Project Manager"
        />
        {/* Add more TeamMemberCard components as needed */}
      </div>
      <H3>Related Resources</H3>
      <div className={styles.githubButton}>
        <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer">
          <Button>
            <img src="/github.png" alt="GitHub" width={24} height={24} />
            Github Repo
          </Button>
        </a>
        <a href={githubRepoMSUrl} target="_blank" rel="noopener noreferrer">
          <Button>
            <img src="/github.png" alt="GitHub" width={24} height={24} />
            Github: Invoice & Recommendation MS
          </Button>
        </a>
      </div>
    </Container>
  );
};

export default About;
