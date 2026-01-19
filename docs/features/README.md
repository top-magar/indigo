# Features Documentation

This directory contains feature-specific documentation for the Indigo platform.

## Structure

### `/ai-services/`
AI services integration and implementation:
- Billing strategy
- Implementation summaries
- Dashboard integration
- Service integration completion

**Key Services**:
- Text generation (product descriptions, content)
- Image analysis (labels, text detection, moderation)
- OCR (document text extraction)
- Sentiment analysis
- Translation
- Text-to-speech

### `/email/`
Email service documentation:
- Implementation guides
- Service summaries
- AWS SES integration

**Features**:
- Single and batch email sending
- Email identity verification
- Template support
- Local development mode

### `/visual-editor/`
Visual editor and storefront customization:
- Editor analysis and code
- Block system architecture
- Storefront approach analysis

**Capabilities**:
- Drag-and-drop visual editor
- Dynamic theming per tenant
- Real-time preview
- Custom block creation

## Service Abstraction

All features use the unified service abstraction layer for:
- Provider flexibility (AWS or local)
- Consistent error handling
- Automatic retries
- Observability
- Type safety

See `/aws/abstraction-layer/` for implementation details.
