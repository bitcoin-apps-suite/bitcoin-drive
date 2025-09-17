'use client'

import React from 'react'
import Image from 'next/image'
import { GoogleDriveFile } from '@/types/drive'
import { 
  FileText, 
  Video, 
  Music, 
  Image as ImageIcon, 
  Archive, 
  File,
  ExternalLink,
  Zap,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Download
} from 'lucide-react'

interface GoogleDriveFileCardProps {
  file: GoogleDriveFile
  onTokenize: (file: GoogleDriveFile) => void
  viewMode?: 'grid' | 'list'
}

export default function GoogleDriveFileCard({ 
  file, 
  onTokenize, 
  viewMode = 'grid' 
}: GoogleDriveFileCardProps) {
  
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('video/')) return <Video size={20} />
    if (mimeType.startsWith('audio/')) return <Music size={20} />
    if (mimeType.startsWith('image/')) return <ImageIcon size={20} />
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText size={20} />
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive size={20} />
    return <File size={20} />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
    return (bytes / 1073741824).toFixed(1) + ' GB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('video/')) return '#ff6b6b'
    if (mimeType.startsWith('audio/')) return '#4ecdc4'
    if (mimeType.startsWith('image/')) return '#45b7d1'
    if (mimeType.includes('pdf')) return '#f39c12'
    if (mimeType.includes('document')) return '#3498db'
    return '#95a5a6'
  }

  if (viewMode === 'list') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        transition: 'all 0.3s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid rgba(0, 255, 136, 0.3)'
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
      }}>
        
        {/* File Icon/Thumbnail */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getFileTypeColor(file.mimeType)
        }}>
          {file.thumbnailLink ? (
            <Image
              src={file.thumbnailLink}
              alt={file.name}
              width={40}
              height={40}
              style={{ borderRadius: '6px', objectFit: 'cover' }}
            />
          ) : (
            getFileIcon(file.mimeType)
          )}
        </div>

        {/* File Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#ffffff', 
            fontWeight: '500',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {file.name}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            gap: '8px'
          }}>
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>{formatDate(file.modifiedTime)}</span>
            <span>•</span>
            <span style={{ 
              padding: '2px 6px', 
              backgroundColor: 'rgba(0, 255, 136, 0.1)', 
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              Google Drive
            </span>
          </div>
        </div>

        {/* Estimated Value */}
        <div style={{ textAlign: 'right', marginRight: '16px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
            Est. Value
          </div>
          <div style={{ fontSize: '14px', color: '#00ff88', fontWeight: '500' }}>
            ₿ {file.estimatedValue.toFixed(6)}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {file.webViewLink && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(file.webViewLink, '_blank')
              }}
              style={{
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ExternalLink size={12} />
              View
            </button>
          )}
          
          {file.canTokenize && !file.isTokenized && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTokenize(file)
              }}
              style={{
                padding: '6px 12px',
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '4px',
                color: '#00ff88',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Zap size={12} />
              Tokenize
            </button>
          )}

          {file.isTokenized && (
            <div style={{
              padding: '6px 12px',
              background: 'rgba(0, 255, 136, 0.2)',
              border: '1px solid rgba(0, 255, 136, 0.4)',
              borderRadius: '4px',
              color: '#00ff88',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Tokenized
            </div>
          )}
        </div>
      </div>
    )
  }

  // Grid view (default)
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '16px',
      transition: 'all 0.3s',
      cursor: 'pointer',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.border = '1px solid rgba(0, 255, 136, 0.3)'
      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
    }}>
      
      {/* File Preview/Icon */}
      <div style={{
        width: '100%',
        height: '120px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        overflow: 'hidden'
      }}>
        {file.thumbnailLink ? (
          <Image
            src={file.thumbnailLink}
            alt={file.name}
            width={120}
            height={120}
            style={{ borderRadius: '8px', objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <div style={{ color: getFileTypeColor(file.mimeType) }}>
            {React.cloneElement(getFileIcon(file.mimeType), { size: 48 })}
          </div>
        )}
      </div>

      {/* File Info */}
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '14px', 
          color: '#ffffff', 
          fontWeight: '500',
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {file.name}
        </div>
        
        <div style={{ 
          fontSize: '12px', 
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '8px'
        }}>
          {formatFileSize(file.size)} • {formatDate(file.modifiedTime)}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ 
            padding: '4px 8px', 
            backgroundColor: 'rgba(0, 255, 136, 0.1)', 
            borderRadius: '4px',
            fontSize: '10px',
            color: '#00ff88'
          }}>
            Google Drive
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: '#00ff88',
            fontWeight: '500'
          }}>
            ₿ {file.estimatedValue.toFixed(6)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        {file.webViewLink && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(file.webViewLink, '_blank')
            }}
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <ExternalLink size={12} />
            View
          </button>
        )}
        
        {file.canTokenize && !file.isTokenized && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTokenize(file)
            }}
            style={{
              flex: 2,
              padding: '8px',
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: '6px',
              color: '#00ff88',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Zap size={12} />
            Tokenize File
          </button>
        )}

        {file.isTokenized && (
          <div style={{
            flex: 2,
            padding: '8px',
            background: 'rgba(0, 255, 136, 0.2)',
            border: '1px solid rgba(0, 255, 136, 0.4)',
            borderRadius: '6px',
            color: '#00ff88',
            fontSize: '12px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            ✓ Tokenized
          </div>
        )}
      </div>
    </div>
  )
}