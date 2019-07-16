import React from 'react';
import { StaticQuery, graphql } from 'gatsby';

type StaticQueryData = {
  site: {
    siteMetadata: {
      description: string;
      social: {
        twitter: string;
        github: string;
        linkedin: string;
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
                github
                linkedin
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
              <a href={social.twitter} target="_blank" className="bio-link">
                Twitter
              </a>
              <a href={social.github} target="_blank" className="bio-link">
                Github
              </a>
              <a href={social.linkedin} target="_blank" className="bio-link">
                LinkedIn
              </a>
            </p>
          </div>
        );
      }}
    />
  );
}
