// Matheus Henrique Conceição Bonore 567779
// Rafael Santos Souto Oliveira 571490

// https://github.com/MatheusBonore/GraphQL-API

const express = require('express');
const expressGraphQL = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require('graphql');
const app = express();

const authors = [
  { id: 1, name: 'J. K. Rowling' },
  { id: 2, name: 'J. R. R. Tolkien' },
  { id: 3, name: 'Brent Weeks' },
];

const books = [
  { id: 1, name: 'Harry Potter and the Chamber of Screts', authorId: 1 },
  { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
  { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
  { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
  { id: 5, name: 'The Two Towers', authorId: 2 },
  { id: 6, name: 'The Return of the King', authorId: 2 },
  { id: 7, name: 'The Way of Shadows', authorId: 3 },
  { id: 8, name: 'Beyond the Shadows', authorId: 3 },
];

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt), },
    name: { type: GraphQLNonNull(GraphQLString), },
    authorId: { type: GraphQLNonNull(GraphQLInt), },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find(author => author.id === book.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents a author of a book',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt), },
    name: { type: GraphQLNonNull(GraphQLString), },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter(book => book.authorId === author.id);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    book: {
      type: BookType,
      description: 'A Single book',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt), },
      },
      resolve: (parent, args) => {
        return books.find(book => book.id === args.id);
      },
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of All Books',
      resolve: () => books,
    },
    author: {
      type: AuthorType,
      description: 'A Single author',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt), },
      },
      resolve: (parent, args) => {
        return authors.find(author => author.id === args.id);
      },
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of All Authors',
      resolve: () => authors,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add a book',
      args: {
        name: { type: GraphQLNonNull(GraphQLString), },
        authorId: { type: GraphQLNonNull(GraphQLInt), },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    changeBook: {
      type: BookType,
      description: 'Change a book',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt), },
        name: { type: GraphQLNonNull(GraphQLString), },
        authorId: { type: GraphQLNonNull(GraphQLInt), },
      },
      resolve: (parent, args) => {
        const book = {
          id: args.id,
          name: args.name,
          authorId: args.authorId,
        };
        books.forEach((element, index) => {
          if (element.id === book.id) {
            books[index] = book;
            return book;
          }
        });
      },
    },
    removeBook: {
      type: BookType,
      description: 'Remove a book',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt), },
      },
      resolve: (parent, args) => {
        books.forEach((element, index) => {
          if (element.id === args.id) {
            return books.splice(index, 1);
          }
        });
      },
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString), },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
    changeAuthor: {
      type: AuthorType,
      description: 'Change an author',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt), },
        name: { type: GraphQLNonNull(GraphQLString), },
      },
      resolve: (parent, args) => {
        const author = {
          id: args.id,
          name: args.name,
        };
        authors.forEach((element, index) => {
          if (element.id == author.id) {
            authors[index] = author;
            return author;
          }
        });
      },
    },
    removeAuthor: {
      type: AuthorType,
      description: 'Remove an author',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt), },
      },
      resolve: (parent, args) => {
        authors.forEach((element, index) => {
          if (element.id === args.id) {
            for (var i = books.length - 1; i >= 0; i--) {
              if (books[i].id === element.authorId) {
                books.splice(i, 1);
              }
            }
            return authors.splice(index, 1);
          }
        });
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use('/graphql', expressGraphQL.graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.listen(4000., () => {
  console.log('Server Running')
});