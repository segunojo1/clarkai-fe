import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link as PdfLink } from '@react-pdf/renderer';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #eee',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.6,
  },
  paragraph: {
    marginBottom: 10,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
  },
  list: {
    marginLeft: 20,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  listItemBullet: {
    width: 20,
    paddingRight: 5,
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    marginVertical: 8,
    fontFamily: 'Courier',
    fontSize: 10,
  },
  inlineCode: {
    backgroundColor: '#f5f5f5',
    padding: '1px 4px',
    borderRadius: 3,
    fontFamily: 'Courier',
    fontSize: 10,
  },
  link: {
    color: '#1a73e8',
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
});

interface MaterialPdfProps {
  content: string;
  title?: string;
}

// Define the type for markdown components
type MarkdownComponents = {
  [nodeType: string]: React.ComponentType<any>;
};

// Custom components for react-markdown to render in PDF
const components: MarkdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.paragraph}><Text>{children}</Text></View>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.heading1}><Text>{children}</Text></View>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.heading2}><Text>{children}</Text></View>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.heading3}><Text>{children}</Text></View>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.list}>{children}</View>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.list}>{children}</View>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemBullet}>•</Text>
      <Text>{children}</Text>
    </View>
  ),
  code: ({ children, inline }: { children?: React.ReactNode; inline?: boolean }) => (
    <Text style={inline ? styles.inlineCode : styles.codeBlock}>
      {String(children).replace(/\n$/, '')}
    </Text>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <PdfLink src={href || '#'} style={styles.link}>
      {children}
    </PdfLink>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.table}>
      {children}
    </View>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.tableHeader}>{children}</View>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <View>{children}</View>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.tableRow}>{children}</View>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <View style={[styles.tableCol, styles.tableHeader]}>
      <Text>{children}</Text>
    </View>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.tableCol}>
      <Text>{children}</Text>
    </View>
  ),
};

const MaterialPdf: React.FC<MaterialPdfProps> = ({ content, title = 'Generated Material' }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.content}>
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            components={components}
          >
            {content}
          </Markdown>
        </View>
      </Page>
    </Document>
  );
};

export default MaterialPdf;
