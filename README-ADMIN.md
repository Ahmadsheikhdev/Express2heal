# Admin Dashboard for Psychoeducational Content Management

This admin dashboard provides a comprehensive interface for managing psychoeducational content in the system. It allows administrators to validate, review, approve, and manage content sourced from Google Scholar, Google Books, or manually submitted by users.

## Features

### Content Management

- **Content Listing**: View all content with filtering by status (Pending, Approved, Rejected, Needs Revision)
- **Content Review**: Detailed view of content with the ability to approve, reject, or request revisions
- **Content Creation**: Add new psychoeducational content manually
- **Content Deletion**: Remove inappropriate or outdated content

### User Management

- **User Listing**: View all users with filtering by role
- **Role Assignment**: Assign roles to users (Admin, Content Validator, User)
- **Permission Management**: Grant specific permissions to users:
  - Can Approve Content
  - Can Edit Content
  - Can Delete Content
  - Can Manage Users

## User Roles

### Administrator

- Full access to all features
- Can manage users and assign roles
- Can approve, edit, and delete content
- Can configure system settings

### Content Validator

- Can review and validate content
- Can approve or reject content
- Can request revisions for content
- Limited access to user management

### Regular User

- Can view approved content
- Can submit content for review
- Cannot access admin dashboard

## Content Validation Process

1. Content is submitted to the system (either manually by users or sourced through Google Scholar/Books)
2. The system performs an initial screening for formatting, relevance, and basic completeness
3. Content is queued for human review
4. A content validator reviews the material for:
   - Accuracy
   - Relevance
   - Alignment with mental health research and best practices
5. The validator can:
   - Approve the content (content is added to the resource library)
   - Reject the content (content is archived or removed)
   - Request revisions (content is returned to the author with feedback)

## Accessing the Admin Dashboard

The admin dashboard is available at `/admin` and requires appropriate authentication and authorization. Only users with admin or content validator roles can access the dashboard.

## Future Improvements

1. **Advanced Content Search**: Implement full-text search for content
2. **Content Analytics**: Track content usage and popularity
3. **Automated Content Screening**: Use AI to pre-screen content for quality and relevance
4. **Bulk Content Import**: Allow importing multiple content items at once
5. **Content Versioning**: Track changes to content over time
6. **Content Categories**: Organize content into categories and subcategories
7. **Content Recommendations**: Suggest related content based on user behavior
8. **Content Export**: Allow exporting content in various formats (PDF, DOCX, etc.)
9. **Content Scheduling**: Schedule content to be published at a specific date/time
10. **Content Collaboration**: Allow multiple validators to collaborate on content review 