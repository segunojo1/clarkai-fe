import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Register font if needed
// Font.register({ family: 'Arial', src: 'path/to/arial.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    lineHeight: 1.5,
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
    fontSize: 14,
    color: '#666',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.6,
  },
  section: {
    marginBottom: 20,
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    marginVertical: 5,
    fontFamily: 'Courier',
    fontSize: 10,
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
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
  },
});

interface MaterialPdfProps {
  content: string;
  title?: string;
}

const MaterialPdf: React.FC<MaterialPdfProps> = ({ content, title = 'Generated Material' }) => {
  // Simple markdown parser for common elements
  const parseMarkdown = (text: string) => {
    if (!text) return [];
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Skip empty lines
      if (!line.trim()) return <Text key={index}> </Text>;
      
      // Headers
      if (line.startsWith('### ')) {
        return (
          <Text key={index} style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>
            {line.replace('### ', '')}
          </Text>
        );
      }
      
      // Subheaders
      if (line.startsWith('## ')) {
        return (
          <Text key={index} style={{ fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>
            {line.replace('## ', '')}
          </Text>
        );
      }
      
      // Main headers
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>
            {line.replace('# ', '')}
          </Text>
        );
      }
      
      // Code blocks
      if (line.startsWith('    ')) {
        return (
          <View key={index} style={styles.codeBlock}>
            <Text style={{ fontFamily: 'Courier' }}>{line.trim()}</Text>
          </View>
        );
      }
      
      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text>• </Text>
            <Text>{line.replace('- ', '')}</Text>
          </View>
        );
      }
      
      // Regular text
      return (
        <Text key={index} style={{ marginBottom: 8 }}>
          {line || ' '}
        </Text>
      );
    });
  };

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.content}>
          {parseMarkdown(content)}
        </View>
      </Page>
    </Document>
  );
};

export default MaterialPdf;
