import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/layout';
import Head from '../components/head';

interface Props {
  readonly data: PageQueryData;
}

export default class Tags extends React.Component<Props> {
  render() {
    const { data } = this.props;
    const siteTitle = data.site.siteMetadata.title;

    return (
      <Layout title={siteTitle}>
        <Head title="All tags" keywords={[`blog`, `gatsby`, `javascript`, `react`]} />
        <article>
          <p>
            Full-stack engineer with experience in scalability, dev-ops, best practices and design. Currently inventing
            the future of home shopping at Brillio. Born and raised in Mysuru, I'm currently living in Bengaluru and
            working as a Technical Specialist at Brillio. I enjoy all things technology, football, and music.
          </p>
        </article>
      </Layout>
    );
  }
}

interface PageQueryData {
  site: {
    siteMetadata: {
      title: string;
    };
  };
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
