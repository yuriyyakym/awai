import Category from './Category';
import Id from './Id';

export default interface Task {
  categoryId: Category['id'];
  description: string;
  id: Id;
  title: string;
}
