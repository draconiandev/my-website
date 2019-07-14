import React from 'react';
import { StaticQuery, graphql } from 'gatsby';

type StaticQueryData = {
  site: {
    siteMetadata: {
      description: string;
      social: {
        twitter: string;
      };
      author: {
        name: string;
      };
    };
  };
};

export default function() {
  return (
    <StaticQuery
      query={graphql`
        query {
          site {
            siteMetadata {
              description
              social {
                twitter
              }
              author {
                name
              }
            }
          }
        }
      `}
      render={(data: StaticQueryData) => {
        const { description, social, author } = data.site.siteMetadata;
        return (
          <div>
            <h1>{description}</h1>
            <p>
              By {author.name}
              <br />
              <a href={social.twitter}>Twitter</a>
            </p>
          </div>
        );
      }}
    />
  );
}
