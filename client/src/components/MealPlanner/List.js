import React from 'react';
import { Paper, Typography, CssBaseline } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Title from './Title';
import Meal from './Meal';
import Add from './Add';

const useStyle = makeStyles((theme) => ({
  root: {
    width: '270px',
    backgroundColor: '#EBECF0',
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

const List = (props) => {
  const classes = useStyle();
  return (
    <div>
      <Paper className={classes.root}>
        <CssBaseline />
        <Title title={props.title} />
        {props.meals.map((meal) => {
          return <Meal meal={meal} listId={props.listId} title={props.title} />;
        })}
        <Add
          listId={props.listId}
          title={props.title}
          recipes={props.recipes}
        />
      </Paper>
    </div>
  );
};

export default List;
