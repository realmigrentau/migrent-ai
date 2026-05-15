import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/developers",
      permanent: true,
    },
  };
};

export default function ApiDocsRedirect() {
  return null;
}
