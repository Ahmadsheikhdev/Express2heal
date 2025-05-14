import { NextResponse } from 'next/server';

// This is a simple in-memory store for demonstration purposes
// In a real application, you would use a database
let searchHistory = [];

export async function GET(request) {
  // Return the search history
  return NextResponse.json(searchHistory);
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate the request body
    if (!data.query || typeof data.query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query parameter' },
        { status: 400 }
      );
    }
    
    // Add the query to the search history
    const newEntry = {
      id: Date.now().toString(),
      query: data.query,
      timestamp: new Date().toISOString(),
    };
    
    // Add to the beginning of the array (most recent first)
    searchHistory = [newEntry, ...searchHistory];
    
    // Limit the history to 50 entries
    if (searchHistory.length > 50) {
      searchHistory = searchHistory.slice(0, 50);
    }
    
    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('Error saving search query:', error);
    return NextResponse.json(
      { error: 'Failed to save search query' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Delete a specific entry
      searchHistory = searchHistory.filter(entry => entry.id !== id);
    } else {
      // Clear all history
      searchHistory = [];
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting search history:', error);
    return NextResponse.json(
      { error: 'Failed to delete search history' },
      { status: 500 }
    );
  }
} 